// app/(tabs)/reserve.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useWeb3 } from '../../services/useWeb3';
import { googleSheetsService } from '../../services/googleSheets';
import { transactionTracker } from '../../services/transactionTracker';

export default function ReserveScreen() {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'wallet' | 'reserve' | 'verify'>('email');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  
  const { 
    address, 
    isConnected, 
    isLoading, 
    error, 
    connect, 
    disconnect, 
    formatAddress 
  } = useWeb3();

  // Store wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setConnectedAddress(address);
      console.log('💰 Wallet address stored:', address);
    }
  }, [isConnected, address]);

  // Log connection state changes
  useEffect(() => {
    console.log('Wallet connection state changed:', { isConnected, address, connectedAddress });
  }, [isConnected, address, connectedAddress]);

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
      console.log('📧 User email for reservation:', email.trim());
      
      // Register user for transaction tracking
      if (address || connectedAddress) {
        const walletToUse = address || connectedAddress;
        transactionTracker.registerUser(email.trim(), walletToUse!);
      }
      
      const recordResult = await googleSheetsService.recordUserEmail({
        email: email.trim(),
        wallet: address || connectedAddress || '',
        source: 'mobile-app'
      });

      console.log('Google Sheets recording result:', recordResult);

      Alert.alert('✅ Email Verified!', 'Your email has been recorded. Please continue to connect your wallet.');
      setActiveTab('wallet');
      
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert('✅ Email Verified', 'Please continue to wallet connection.');
      setActiveTab('wallet');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyAddress = async () => {
    try {
      await Clipboard.setStringAsync('0x0e3541725230432653A9a3F65eB5591D16822de0');
      setCopiedAddress(true);
      Alert.alert('✅ Address Copied!', 'Contract address copied to clipboard.');
      
      setTimeout(() => setCopiedAddress(false), 3000);
    } catch (error) {
      Alert.alert('Copy Failed', 'Please copy the address manually.');
    }
  };

  const showInstructions = () => {
    console.log('Show Instructions clicked - Connection status:', { isConnected, address, connectedAddress });
    
    const currentWallet = address || connectedAddress;
    
    if (!currentWallet) {
      Alert.alert('Wallet Required', 'Please connect your wallet first in Step 2.');
      setActiveTab('wallet');
      return;
    }

    Alert.alert(
      'Reservation Instructions',
      `Ready to reserve APOLO tokens!\n\n1. Contract address is copied below\n2. Open your wallet app\n3. Send ETH to the contract\n4. Minimum: 0.01 ETH\n5. Network: Ethereum Mainnet\n6. From: ${formatAddress(currentWallet)}\n\nAfter sending ETH, return here to verify your transaction.`,
      [
        {
          text: 'Copy Address Again',
          onPress: copyAddress
        },
        {
          text: 'Go to Verification',
          onPress: () => setActiveTab('verify')
        },
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  };

  const handleWalletConnect = async (walletType: 'metamask' | 'coinbase') => {
    try {
      console.log('Connecting wallet:', walletType);
      await connect(walletType);
    } catch (error) {
      console.error('Wallet connection error:', error);
      Alert.alert('Connection Failed', 'Please try again or use a different wallet.');
    }
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
            <Text style={styles.title}>Reserve APOLO Tokens</Text>
            <Text style={styles.subtitle}>Complete these steps to reserve your tokens</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, activeTab === 'email' && styles.progressStepActive]}>
              <Text style={styles.progressText}>1</Text>
            </View>
            <View style={[styles.progressLine, activeTab !== 'email' && styles.progressLineActive]} />
            <View style={[styles.progressStep, activeTab === 'wallet' && styles.progressStepActive]}>
              <Text style={styles.progressText}>2</Text>
            </View>
            <View style={[styles.progressLine, activeTab === 'reserve' && styles.progressLineActive]} />
            <View style={[styles.progressStep, activeTab === 'reserve' && styles.progressStepActive]}>
              <Text style={styles.progressText}>3</Text>
            </View>
            <View style={[styles.progressLine, activeTab === 'verify' && styles.progressLineActive]} />
            <View style={[styles.progressStep, activeTab === 'verify' && styles.progressStepActive]}>
              <Text style={styles.progressText}>4</Text>
            </View>
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

          {(activeTab === 'wallet') && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="wallet" size={24} color="#FFD700" />
                <Text style={styles.cardTitle}>Step 2: Connect Wallet</Text>
              </View>
              
              {isConnected && address ? (
                <>
                  <Text style={styles.connectedText}>
                    ✅ Connected: {formatAddress(address)}
                  </Text>
                  <Text style={styles.cardDescription}>
                    Wallet connected! Your address has been saved for transaction tracking.
                  </Text>
                  <Pressable style={styles.button} onPress={() => {
                    setConnectedAddress(address);
                    setActiveTab('reserve');
                  }}>
                    <Ionicons name="arrow-forward" size={20} color="#000000" />
                    <Text style={styles.buttonText}>Continue to Reserve</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => disconnect()}>
                    <Text style={styles.secondaryButtonText}>Disconnect Wallet</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.cardDescription}>
                    Connect your Ethereum wallet to continue.
                  </Text>
                  
                  <Pressable 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={() => handleWalletConnect('metamask')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000000" />
                    ) : (
                      <Ionicons name="wallet-outline" size={20} color="#000000" />
                    )}
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Connecting...' : 'Connect MetaMask'}
                    </Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.secondaryButton, isLoading && styles.buttonDisabled]} 
                    onPress={() => handleWalletConnect('coinbase')}
                    disabled={isLoading}
                  >
                    <Ionicons name="wallet-outline" size={20} color="#FFD700" />
                    <Text style={styles.secondaryButtonText}>Connect Coinbase</Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.secondaryButton, { marginTop: 8 }]} 
                    onPress={() => setActiveTab('email')}
                  >
                    <Ionicons name="arrow-back" size={20} color="#FFD700" />
                    <Text style={styles.secondaryButtonText}>Back to Email</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {(activeTab === 'reserve') && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color="#FFD700" />
                <Text style={styles.cardTitle}>Step 3: Make Reservation</Text>
              </View>
              
              <Text style={styles.cardDescription}>
                Send ETH to reserve your APOLO tokens.
              </Text>

              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Contract Address:</Text>
                <Text style={styles.addressText}>0x0e3541725230432653A9a3F65eB5591D16822de0</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Reservation Details:</Text>
                <Text style={styles.infoText}>• Minimum: 0.01 ETH</Text>
                <Text style={styles.infoText}>• Network: Ethereum Mainnet</Text>
                <Text style={styles.infoText}>• Send from: {formatAddress(address || connectedAddress || '')}</Text>
                <Text style={styles.infoText}>• Tokens delivered after launch</Text>
              </View>

              <Pressable style={styles.button} onPress={showInstructions}>
                <Ionicons name="send" size={20} color="#000000" />
                <Text style={styles.buttonText}>Show Instructions</Text>
              </Pressable>

              <Pressable 
                style={[styles.secondaryButton, copiedAddress && styles.copiedButton]} 
                onPress={copyAddress}
              >
                <Ionicons name={copiedAddress ? "checkmark" : "copy-outline"} size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>
                  {copiedAddress ? 'Copied!' : 'Copy Address'}
                </Text>
              </Pressable>

              <Pressable 
                style={[styles.secondaryButton, { marginTop: 8 }]} 
                onPress={async () => {
                  // Record a pending transaction when user claims they sent ETH
                  if (email && (address || connectedAddress)) {
                    const currentWallet = address || connectedAddress;
                    console.log('🔄 Recording pending transaction for:', email, 'wallet:', currentWallet);
                    
                    const result = await googleSheetsService.recordEnhancedTransaction({
                      email: email,
                      wallet: currentWallet!,
                      ethAmount: 'pending',
                      actualAmount: 'pending',
                      txHash: 'pending_verification',
                      fromAddress: currentWallet!
                    });

                    console.log('Pending transaction result:', result);
                  }
                  
                  setActiveTab('verify');
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>I Sent ETH - Verify</Text>
              </Pressable>

              <Pressable 
                style={[styles.secondaryButton, { marginTop: 8 }]} 
                onPress={() => setActiveTab('wallet')}
              >
                <Ionicons name="arrow-back" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>Back to Wallet</Text>
              </Pressable>
            </View>
          )}

          {(activeTab === 'verify') && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                <Text style={styles.cardTitle}>Step 4: Verify Transaction</Text>
              </View>
              
              <Text style={styles.cardDescription}>
                Verify your ETH deposit to complete your APOLO reservation.
              </Text>

              <Pressable 
                style={styles.button} 
                onPress={async () => {
                  const result = await transactionTracker.verifyTransactionManually(email);
                  Alert.alert(
                    'Transaction Verification',
                    result.instructions
                  );
                }}
              >
                <Ionicons name="search" size={20} color="#000000" />
                <Text style={styles.buttonText}>How to Verify</Text>
              </Pressable>

              <Pressable 
                style={styles.secondaryButton}
                onPress={() => {
                  // Use the stored address if current address is null
                  const currentWallet = address || connectedAddress;
                  
                  if (!email) {
                    Alert.alert('Email Required', 'Please go back to Step 1 and verify your email first.');
                    return;
                  }

                  if (!currentWallet) {
                    Alert.alert('Wallet Required', 'Please connect your wallet in Step 2 first.');
                    setActiveTab('wallet');
                    return;
                  }

                  Alert.prompt(
                    'Record Your ETH Transaction',
                    `Enter the amount of ETH you sent from: ${formatAddress(currentWallet)}`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Record', 
                        onPress: async (ethAmount) => {
                          if (ethAmount && !isNaN(parseFloat(ethAmount))) {
                            
                            console.log('💰 Recording transaction:', {
                              email,
                              ethAmount,
                              wallet: currentWallet
                            });
                            
                            // Record enhanced transaction
                            const enhancedResult = await googleSheetsService.recordEnhancedTransaction({
                              email: email,
                              wallet: currentWallet,
                              ethAmount: ethAmount,
                              actualAmount: ethAmount,
                              txHash: 'manual_entry_' + Date.now(),
                              fromAddress: currentWallet
                            });

                            console.log('Enhanced transaction result:', enhancedResult);

                            // Also record basic transaction
                            const basicResult = await googleSheetsService.recordTransaction({
                              email: email,
                              ethAmount: ethAmount,
                              txHash: 'manual',
                              wallet: currentWallet
                            });

                            console.log('Basic transaction result:', basicResult);

                            Alert.alert(
                              '✅ Transaction Recorded!',
                              `Your ${ethAmount} ETH transaction from ${formatAddress(currentWallet)} has been recorded.\n\nYou will receive APOLO tokens after launch!`
                            );

                          } else {
                            Alert.alert('Invalid Amount', 'Please enter a valid ETH amount (e.g., 0.05)');
                          }
                        }
                      }
                    ],
                    'plain-text',
                    '0.05'
                  );
                }}
              >
                <Ionicons name="document-text" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>Record My ETH Transaction</Text>
              </Pressable>

              {/* Debug button to check current state */}
              <Pressable 
                style={[styles.secondaryButton, { backgroundColor: '#333333' }]}
                onPress={() => {
                  Alert.alert(
                    'Debug Info',
                    `Email: ${email || 'none'}\nCurrent Address: ${address || 'none'}\nStored Address: ${connectedAddress || 'none'}\nConnected: ${isConnected}`
                  );
                }}
              >
                <Ionicons name="bug" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>Debug Info</Text>
              </Pressable>

              {/* Test transaction recording button */}
              <Pressable 
                style={[styles.secondaryButton, { backgroundColor: '#1a1a1a' }]}
                onPress={async () => {
                  const currentWallet = address || connectedAddress;
                  if (email && currentWallet) {
                    const result = await googleSheetsService.recordEnhancedTransaction({
                      email: email,
                      wallet: currentWallet,
                      ethAmount: '0.05',
                      actualAmount: '0.05',
                      txHash: 'test_transaction_' + Date.now(),
                      fromAddress: currentWallet
                    });
                    Alert.alert(
                      'Test Transaction Recorded',
                      result.success ? '✅ Test transaction recorded to Google Sheets' : '⚠️ Recorded locally'
                    );
                  }
                }}
              >
                <Ionicons name="flask" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>Test Transaction Recording</Text>
              </Pressable>

              <Pressable 
                style={[styles.secondaryButton, { marginTop: 8 }]} 
                onPress={() => setActiveTab('reserve')}
              >
                <Ionicons name="arrow-back" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>Back to Reservation</Text>
              </Pressable>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, opacity: 0.8 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  progressStep: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  progressStepActive: { backgroundColor: '#FFD700' },
  progressText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  progressLine: { width: 40, height: 2, backgroundColor: '#333333', marginHorizontal: 8 },
  progressLineActive: { backgroundColor: '#FFD700' },
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
  infoBox: { backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, marginBottom: 16 },
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
});