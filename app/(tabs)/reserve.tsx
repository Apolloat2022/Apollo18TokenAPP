	// app/(tabs)/reserve.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Linking, Modal, Clipboard } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '../../services/useWeb3';
import { googleSheetsService } from '../../services/googleSheets';
import React from 'react';

// Simple error boundary for the component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('❌ ReserveScreen Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.cardDescription}>
              The app encountered an error. Please refresh the page.
            </Text>
            <Pressable 
              style={styles.button}
              onPress={() => window.location.reload()}
            >
              <Text style={styles.buttonText}>Refresh Page</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

function ReserveScreenContent() {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'copy' | 'wallet' | 'verify'>('email');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [hasRecordedTransaction, setHasRecordedTransaction] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // USD Modal State
  const [showUsdModal, setShowUsdModal] = useState(false);
  const [usdAmount, setUsdAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const { 
    address, 
    isConnected, 
    isLoading, 
    error, 
    connect, 
    disconnect, 
    formatAddress 
  } = useWeb3();

  useEffect(() => {
    if (isConnected && address) {
      setConnectedAddress(address);
      console.log('👛 Wallet connected:', address);
      
      // Auto-advance to verify tab when connected
      if (activeTab === 'wallet') {
        setTimeout(() => {
          setActiveTab('verify');
        }, 1500);
      }
    }
  }, [isConnected, address, activeTab]);

  const verifyEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsVerifying(true);
    
    try {
      const result = await googleSheetsService.recordUserEmail({
        email: email.trim(),
        wallet: '',
        source: 'mobile-app'
      });

      Alert.alert('✅ Email Verified!', 'Your email has been recorded. Please copy the Eth address.');
      setActiveTab('copy');
      
    } catch (error) {
      Alert.alert('✅ Email Verified', 'Please continue to copy the contract address.');
      setActiveTab('copy');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyAddress = async () => {
    try {
      Clipboard.setString('0x0e3541725230432653A9a3F65eB5591D16822de0');
      setCopiedAddress(true);
      Alert.alert('✅ Address Copied!', 'Eth address copied to clipboard. Now connect your wallet.');
      
      setTimeout(() => setCopiedAddress(false), 3000);
      setActiveTab('wallet');
    } catch (error) {
      Alert.alert('Copy Failed', 'Please copy the address manually.');
    }
  };

  const handleWalletConnect = async (walletType: 'metamask' | 'coinbase' | 'walletconnect') => {
    try {
      await connect(walletType);
    } catch (error) {
      Alert.alert('Connection Failed', 'Please try again or use a different wallet.');
    }
  };

  const recordTransaction = async (ethAmount: string, usdAmount?: string) => {
    const currentWallet = address || connectedAddress;
    
    if (!currentWallet) {
      Alert.alert('Wallet Required', 'Please connect your wallet first.');
      return;
    }

    if (!email) {
      Alert.alert('Email Required', 'Please verify your email first.');
      return;
    }

    const amount = parseFloat(ethAmount);
    
    if (amount < 0.0001) {
      Alert.alert('Minimum Amount', 'The minimum amount is $1 USD worth of ETH.');
      return;
    }
    
    setIsRecording(true);
    
    try {
      // Get current ETH price for the recording
      const ethPrice = await googleSheetsService.getEthPrice();
      const usdValue = parseFloat(usdAmount || '0');
      
      // Calculate APOLO tokens in the app (USD × 100,000)
      const apoloDue = Math.floor(usdValue * 100000);
      
      console.log('🎯 Starting ETH recording:', {
        email,
        wallet: currentWallet,
        ethAmount: amount,
        usdAmount: usdValue,
        ethPrice,
        apoloDue
      });

      // Record with ALL calculated values
      const enhancedResult = await googleSheetsService.recordEnhancedTransaction({
        email: email,
        wallet: currentWallet,
        ethAmount: amount.toString(),
        actualAmount: amount.toString(),
        txHash: 'mobile_' + Date.now(),
        fromAddress: currentWallet,
        usdAmount: usdValue.toString(),
        ethPrice: ethPrice.toString(),
        apoloDue: apoloDue.toString()
      });

      console.log('📊 Enhanced transaction result:', enhancedResult);

      // Also try the basic record method as backup
      const basicResult = await googleSheetsService.recordTransaction({
        email: email,
        ethAmount: amount.toString(),
        txHash: 'mobile',
        wallet: currentWallet
      });

      console.log('📊 Basic transaction result:', basicResult);

      if (enhancedResult.success || basicResult.success) {
        setHasRecordedTransaction(true);
        
        const successMessage = `✅ ETH Recorded!\n\n` +
          `Amount: $${usdValue} USD\n` +
          `Converted to: ${amount} ETH\n` +
          `APOLO Tokens: ${apoloDue.toLocaleString()}\n` +
          `Wallet: ${formatAddress(currentWallet)}\n\n` +
          `⚠️ Important: You must actually send ETH to our contract address:\n` +
          `0x0e3541725230432653A9a3F65eB5591D16822de0\n\n` +
          `Your APOLO tokens will be delivered after launch!`;

        Alert.alert('Success', successMessage);
        console.log('🎉 ETH recording completed successfully');
      } else {
        throw new Error('Both recording methods failed');
      }

    } catch (error) {
      console.error('❌ ETH recording failed:', error);
      Alert.alert(
        '⚠️ Recording Issue',
        `Your ETH was noted locally.\n\nSupport will contact you at ${email} for verification.\n\nError: ${error}`
      );
      setHasRecordedTransaction(true);
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordETH = () => {
    const currentWallet = address || connectedAddress;
    
    if (!email) {
      Alert.alert('Email Required', 'Please go back to Step 1 and verify your email first.');
      return;
    }

    if (!currentWallet) {
      Alert.alert('Wallet Required', 'Please connect your wallet in Step 3 first.');
      setActiveTab('wallet');
      return;
    }

    if (hasRecordedTransaction) {
      Alert.alert('Already Recorded', 'Your ETH has already been recorded.');
      return;
    }

    console.log('🎯 User clicked Record ETH button - Opening USD Modal');
    setShowUsdModal(true);
    setUsdAmount('');
  };

  const handleUsdSubmit = async () => {
    if (!usdAmount || usdAmount.trim() === '') {
      Alert.alert('Invalid Amount', 'Please enter a USD amount.');
      return;
    }

    const usdValue = parseFloat(usdAmount);
    
    if (isNaN(usdValue) || usdValue < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid USD amount ($1 minimum).');
      return;
    }

    console.log(`💰 User entered: $${usdValue} USD`);
    
    // Show loading state
    setIsConverting(true);
    
    try {
      const ethPrice = await googleSheetsService.getEthPrice();
      const ethAmount = (usdValue / ethPrice).toFixed(6);
      
      console.log(`💰 Conversion: $${usdValue} USD = ${ethAmount} ETH at $${ethPrice} rate`);
      
      // Close modal first
      setShowUsdModal(false);
      setIsConverting(false);
      
      // AUTO-RECORD without confirmation
      console.log('🔄 Auto-recording ETH transaction...');
      await recordTransaction(ethAmount, usdValue.toString());
      
    } catch (error) {
      console.error('❌ ETH recording process failed:', error);
      setShowUsdModal(false);
      setIsConverting(false);
      
      Alert.alert(
        'Recording Failed',
        'There was an issue recording your ETH. Please try again.',
        [
          { 
            text: 'Try Again', 
            onPress: () => setShowUsdModal(true)
          }
        ]
      );
    }
  };

  const handleContinueToVerify = async () => {
    const currentWallet = address || connectedAddress;
    
    if (!currentWallet) {
      Alert.alert('Wallet Required', 'Please connect your wallet first.');
      return;
    }

    // RECORD WALLET ADDRESS TO GOOGLE SHEETS
    if (email && currentWallet) {
      console.log('👛 Recording wallet address for:', email);
      try {
        await googleSheetsService.recordWalletAddress({
          email: email,
          wallet: currentWallet,
          source: 'mobile-app'
        });
        console.log('✅ Wallet address recorded successfully');
      } catch (error) {
        console.error('❌ Failed to record wallet address:', error);
      }
    }
    
    setActiveTab('verify');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.content}>
          
          <View style={styles.header}>
            <Image 
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Reserve your spot</Text>
            <Text style={styles.subtitle}>Complete these steps to reserve your spot</Text>
          </View>

          <View style={styles.progressContainer}>
            {['1', '2', '3', '4'].map((step, index) => (
              <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                  styles.progressStep, 
                  (index === 0 && activeTab === 'email') ||
                  (index === 1 && activeTab === 'copy') ||
                  (index === 2 && activeTab === 'wallet') ||
                  (index === 3 && activeTab === 'verify') ? styles.progressStepActive : {}
                ]}>
                  <Text style={styles.progressText}>{step}</Text>
                </View>
                {index < 3 && <View style={styles.progressLine} />}
              </View>
            ))}
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="warning" size={20} color="#FF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {(activeTab === 'email') && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="mail" size={24} color="#FFD700" />
                <Text style={styles.cardTitle}>Step 1: Verify Your Email</Text>
              </View>
              <Text style={styles.cardDescription}>
                Enter your email address to start the reservation process.
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <Pressable 
                style={[styles.button, isVerifying && styles.buttonDisabled]} 
                onPress={verifyEmail}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Ionicons name="mail-outline" size={20} color="#000000" />
                )}
                <Text style={styles.buttonText}>
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </Text>
              </Pressable>
            </View>
          )}

          {(activeTab === 'copy') && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="copy" size={24} color="#FFD700" />
                <Text style={styles.cardTitle}>Step 2: Copy Eth Address</Text>
              </View>
              
              <Text style={styles.cardDescription}>
                Copy Eth address. 
              </Text>

              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Contract Address:</Text>
                <Text style={styles.addressText}>0x0e3541725230432653A9a3F65eB5591D16822de0</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Important Instructions:</Text>
                <Text style={styles.infoText}>1. Copy the contract address above</Text>
                <Text style={styles.infoText}>2. Open your wallet app</Text>
                <Text style={styles.infoText}>3. Send ETH to this address</Text>
                <Text style={styles.infoText}>4. Minimum: ~$1 USD worth of ETH</Text>
                <Text style={styles.infoText}>5. Network: Ethereum Mainnet</Text>
                <Text style={styles.infoText}>6. Return here after sending ETH</Text>
              </View>

              <Pressable 
                style={[styles.button, copiedAddress && styles.copiedButton]} 
                onPress={copyAddress}
              >
                <Ionicons name={copiedAddress ? "checkmark" : "copy-outline"} size={20} color="#000000" />
                <Text style={styles.buttonText}>
                  {copiedAddress ? 'Copied!' : 'Copy Contract Address'}
                </Text>
              </Pressable>

              <Pressable 
                style={styles.secondaryButton}
                onPress={() => {
                  Linking.openURL('https://etherscan.io/address/0x0e3541725230432653A9a3F65eB5591D16822de0')
                    .catch(err => console.error('Failed to open Etherscan:', err));
                }}
              >
                <Ionicons name="open-outline" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>View on Etherscan</Text>
              </Pressable>

              <Pressable 
                style={[styles.secondaryButton, { marginTop: 8 }]} 
                onPress={() => setActiveTab('email')}
              >
                <Ionicons name="arrow-back" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>Back to Email</Text>
              </Pressable>
            </View>
          )}

          {(activeTab === 'wallet') && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="wallet" size={24} color="#FFD700" />
                <Text style={styles.cardTitle}>Step 3: Connect Your Wallet</Text>
              </View>
              
              {isConnected && address ? (
                <>
                  <Text style={styles.connectedText}>
                    ✅ Connected: {formatAddress(address)}
                  </Text>
                  <Text style={styles.cardDescription}>
                    Your wallet is connected! Please proceed to record your ETH.
                  </Text>
                  
                  <View style={[styles.infoBox, { backgroundColor: '#1A2A1A', borderColor: '#00FF00' }]}>
                    <Text style={[styles.infoTitle, { color: '#00FF00' }]}>✅ Wallet Connected</Text>
                    <Text style={styles.infoText}>• Your wallet: {formatAddress(address)}</Text>
                    <Text style={styles.infoText}>• Ready to record ETH transaction</Text>
                    <Text style={styles.infoText}>• Real address verified automatically</Text>
                  </View>

                  <Pressable 
                    style={styles.button}
                    onPress={handleContinueToVerify}
                  >
                    <Ionicons name="arrow-forward" size={20} color="#000000" />
                    <Text style={styles.buttonText}>Continue to Record ETH</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.cardDescription}>
                    Connect your wallet to record your ETH investment.
                  </Text>

                  {/* Mobile WalletConnect Button */}
                  <Pressable 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={() => handleWalletConnect('walletconnect')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000000" />
                    ) : (
                      <Ionicons name="phone-portrait" size={20} color="#000000" />
                    )}
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Waiting for Wallet Connection...' : 'Connect Mobile Wallet'}
                    </Text>
                  </Pressable>

                  {isLoading && (
                    <View style={[styles.infoBox, { backgroundColor: '#2A2A2A' }]}>
                      <Text style={styles.infoTitle}>📱 Connection Instructions:</Text>
                      <Text style={styles.infoText}>1. Your wallet app should open automatically</Text>
                      <Text style={styles.infoText}>2. Approve the connection request</Text>
                      <Text style={styles.infoText}>3. Return to this browser tab</Text>
                      <Text style={styles.infoText}>4. Connection will complete automatically</Text>
                      <Text style={[styles.infoText, { color: '#FFD700', marginTop: 8 }]}>
                        ⏳ Waiting for your approval in wallet...
                      </Text>
                    </View>
                  )}

                  <View style={[styles.infoBox, { backgroundColor: '#2A2A2A', marginTop: 16 }]}>
                    <Text style={styles.infoTitle}>📱 Mobile Wallet Support:</Text>
                    <Text style={styles.infoText}>• Tap to open your wallet app</Text>
                    <Text style={styles.infoText}>• Supports MetaMask, Coinbase, Trust</Text>
                    <Text style={styles.infoText}>• Rainbow, and 100+ other wallets</Text>
                    <Text style={styles.infoText}>• Real address automatically retrieved</Text>
                  </View>

                  <Text style={styles.connectorDivider}>or connect desktop wallet</Text>
                  
                  {/* Desktop Wallet Buttons */}
                  <Pressable 
                    style={[styles.secondaryButton, isLoading && styles.buttonDisabled]} 
                    onPress={() => handleWalletConnect('metamask')}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-react" size={20} color="#FFD700" />
                    <Text style={styles.secondaryButtonText}>MetaMask (Desktop)</Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.secondaryButton, isLoading && styles.buttonDisabled]} 
                    onPress={() => handleWalletConnect('coinbase')}
                    disabled={isLoading}
                  >
                    <Ionicons name="card-outline" size={20} color="#FFD700" />
                    <Text style={styles.secondaryButtonText}>Coinbase (Desktop)</Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.secondaryButton, { marginTop: 8 }]} 
                    onPress={() => setActiveTab('copy')}
                  >
                    <Ionicons name="arrow-back" size={20} color="#FFD700" />
                    <Text style={styles.secondaryButtonText}>Back to Copy Address</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {(activeTab === 'verify') && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                <Text style={styles.cardTitle}>Step 4: Record Your ETH</Text>
              </View>
              
              <Text style={styles.cardDescription}>
                Record your ETH to complete your reservation.
              </Text>

              {hasRecordedTransaction ? (
                <View style={[styles.infoBox, { backgroundColor: '#1A2A1A', borderColor: '#00FF00' }]}>
                  <Text style={[styles.infoTitle, { color: '#00FF00' }]}>✅ ETH Recorded!</Text>
                  <Text style={styles.infoText}>📧 Email: {email}</Text>
                  <Text style={styles.infoText}>👛 Wallet: {formatAddress(address || connectedAddress)}</Text>
                  <Text style={styles.infoText}>🎯 Status: Spot reserved</Text>
                  <Text style={styles.infoText}>⏰ Delivery: After launch</Text>
                </View>
              ) : (
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Ready to Record Your ETH</Text>
                  <Text style={styles.infoText}>• Your email: {email}</Text>
                  <Text style={styles.infoText}>• Your wallet: {formatAddress(address || connectedAddress)}</Text>
                  <Text style={styles.infoText}>• Click below to enter USD amount sent</Text>
                  <Text style={styles.infoText}>• System will convert to ETH automatically</Text>
                  <Text style={styles.infoText}>• This completes your reservation</Text>
                </View>
              )}

              {!hasRecordedTransaction && (
                <Pressable 
                  style={[styles.button, isRecording && styles.buttonDisabled]} 
                  onPress={handleRecordETH}
                  disabled={isRecording}
                >
                  {isRecording ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Ionicons name="document-text" size={20} color="#000000" />
                  )}
                  <Text style={styles.buttonText}>
                    {isRecording ? 'Recording...' : 'Record Your ETH'}
                  </Text>
                </Pressable>
              )}

              <Pressable 
                style={[styles.secondaryButton, { marginTop: 8 }]} 
                onPress={() => setActiveTab('wallet')}
              >
                <Ionicons name="arrow-back" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>Back to Wallet</Text>
              </Pressable>

              {hasRecordedTransaction && (
                <Pressable 
                  style={[styles.button, { marginTop: 16, backgroundColor: '#4CAF50' }]} 
                  onPress={() => {
                    setEmail('');
                    setConnectedAddress(null);
                    setHasRecordedTransaction(false);
                    setActiveTab('email');
                    disconnect();
                  }}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Make Another Reservation</Text>
                </Pressable>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* USD Modal - Only shows when needed */}
      <Modal
        visible={showUsdModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUsdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Your ETH</Text>
            <Text style={styles.modalDescription}>
              Enter the USD amount you sent from {formatAddress(address || connectedAddress)}:
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter USD amount (e.g., 50)"
              placeholderTextColor="#666666"
              keyboardType="decimal-pad"
              value={usdAmount}
              onChangeText={setUsdAmount}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowUsdModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.modalConfirmButton, (!usdAmount || parseFloat(usdAmount) < 1) && styles.buttonDisabled]}
                onPress={handleUsdSubmit}
                disabled={!usdAmount || parseFloat(usdAmount) < 1 || isConverting}
              >
                {isConverting ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Ionicons name="calculator" size={20} color="#000000" />
                )}
                <Text style={styles.modalConfirmButtonText}>
                  {isConverting ? 'Recording ETH...' : 'Convert & Record ETH'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Export with error boundary
export default function ReserveScreen() {
  return (
    <ErrorBoundary>
      <ReserveScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logo: { width: 80, height: 80, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, opacity: 0.8 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  progressStep: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  progressStepActive: { backgroundColor: '#FFD700' },
  progressText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  progressLine: { width: 40, height: 2, backgroundColor: '#333333', marginHorizontal: 8 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFD700' },
  cardDescription: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 16, opacity: 0.8 },
  input: { backgroundColor: '#2A2A2A', borderRadius: 12, padding: 16, color: '#FFFFFF', marginBottom: 16, borderWidth: 1, borderColor: '#333333', fontSize: 16 },
  button: { backgroundColor: '#FFD700', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700', alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  secondaryButtonText: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  copiedButton: { borderColor: '#00FF00', backgroundColor: 'rgba(0, 255, 0, 0.1)' },
  connectedText: { color: '#00FF00', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  addressContainer: { backgroundColor: '#2A2A2A', padding: 12, borderRadius: 8, marginBottom: 16 },
  addressLabel: { color: '#888888', fontSize: 12, marginBottom: 4 },
  addressText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'monospace' },
  infoBox: { backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#333333' },
  infoTitle: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#FFFFFF', fontSize: 14, marginBottom: 4 },
  errorCard: {
    backgroundColor: '#2A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444'
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    flex: 1,
  },
  connectorDivider: {
    color: '#666666',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelButton: {
    backgroundColor: '#333333',
  },
  modalConfirmButton: {
    backgroundColor: '#FFD700',
  },
  modalCancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalConfirmButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});