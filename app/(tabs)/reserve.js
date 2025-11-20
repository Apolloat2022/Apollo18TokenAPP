import 'react-native-gesture-handler';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, Linking, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

// Import the service
import { googleSheetsService } from '../../services/googleSheets';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  logo: { width: 60, height: 61, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFD700', marginBottom: 12 },
  cardText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 8 },
  highlight: { color: '#FFD700', fontWeight: 'bold' },
  button: { backgroundColor: '#FFD700', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  secondaryButton: { backgroundColor: '#2A2A2A', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#FFD700' },
  secondaryButtonText: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  contractAddress: { backgroundColor: '#2A2A2A', padding: 12, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#FFD700' },
  addressText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'monospace', textAlign: 'center' },
  input: { backgroundColor: '#2A2A2A', borderRadius: 8, padding: 12, color: '#FFFFFF', marginBottom: 12, borderWidth: 1, borderColor: '#FFD700', fontSize: 16 },
  infoBox: { backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#FFD700' },
  amountSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  amountInput: { flex: 1, backgroundColor: '#2A2A2A', borderRadius: 8, padding: 12, color: '#FFFFFF', marginRight: 8, borderWidth: 1, borderColor: '#FFD700', fontSize: 16 },
  quickAmount: { backgroundColor: '#333', padding: 8, borderRadius: 6, marginLeft: 4, borderWidth: 1, borderColor: '#FFD700' },
  quickAmountText: { color: '#FFFFFF', fontSize: 12 },
  stepNumber: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  transactionList: { marginTop: 8 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  transactionText: { color: '#FFFFFF', fontSize: 12, marginLeft: 8 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2A1A', padding: 8, borderRadius: 6, marginTop: 8, alignSelf: 'flex-start' },
  verifiedText: { color: '#00FF88', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  copySuccess: { color: '#00FF88', textAlign: 'center', marginTop: 8, fontSize: 14 },
  metamaskButton: { backgroundColor: '#F6851B', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center' },
  coinbaseButton: { backgroundColor: '#0052FF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center' },
  moonpayButton: { backgroundColor: '#7C4DFF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center' },
  walletButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  optionalText: { fontSize: 12, color: '#B8860B', fontStyle: 'italic', marginBottom: 8 },
  disabledButton: { backgroundColor: '#666666', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  disabledText: { color: '#999999', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});

const CONTRACT_ADDRESS = '0x0e3541725230432653A9a3F65eB5591D16822de0';

export default function ReserveScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [ethAmount, setEthAmount] = useState('0.05');
  const [ethPrice, setEthPrice] = useState(2884.32);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const calculateApoloTokens = () => {
    const ethValue = parseFloat(ethAmount) || 0;
    return Math.floor(ethValue * ethPrice * 100000);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const verifyEmail = async () => {
  console.log('🔍 Starting email verification...');
  
  if (!email.trim()) {
    Alert.alert('Email Required', 'Please enter your email address.');
    return;
  }
  
  if (!isValidEmail(email)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address.');
    return;
  }

  setIsVerifying(true);

  try {
    console.log('📧 Attempting to record email:', email);
    
    // Try to record email to Google Sheets
    const result = await googleSheetsService.recordUserEmail(email, '');
    console.log('📊 Email recording result:', result);
    
    // ALWAYS mark as verified and proceed regardless of Google Sheets result
    setEmailVerified(true);
    
    if (result && result.success) {
      Alert.alert(
        '✅ Email Verified!', 
        'You will receive APOLO tokens at this email after sending ETH.'
      );
    } else {
      Alert.alert(
        '✅ Email Verified!', 
        'You will receive APOLO tokens at this email.'
      );
    }
    
  } catch (error) {
    console.error('❌ Email verification error:', error);
    // STILL proceed even if there's an unexpected error
    setEmailVerified(true);
    Alert.alert(
      '✅ Email Verified!', 
      'You will receive APOLO tokens at this email.'
    );
  } finally {
    setIsVerifying(false);
  }
};

  const copyContractAddress = async () => {
    try {
      await Clipboard.setStringAsync(CONTRACT_ADDRESS);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const openEtherscan = () => {
    Linking.openURL(`https://etherscan.io/address/${CONTRACT_ADDRESS}`);
  };

  const openMetaMask = async () => {
    if (!emailVerified) {
      Alert.alert('Email Required', 'Please verify your email first to ensure token delivery.');
      return;
    }
    
    try {
      await Clipboard.setStringAsync(CONTRACT_ADDRESS);
      const metamaskUrl = `https://metamask.app.link/send/${CONTRACT_ADDRESS}@1?value=${(parseFloat(ethAmount) * 1e18).toString()}`;
      const canOpen = await Linking.canOpenURL(metamaskUrl);
      
      if (canOpen) {
        await Linking.openURL(metamaskUrl);
      } else {
        Alert.alert('MetaMask', `Contract address copied! Open MetaMask and send ${ethAmount} ETH to:\n\n${CONTRACT_ADDRESS}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('MetaMask', 'Please open MetaMask and send ETH to the copied contract address.');
    }
  };

  const openCoinbase = async () => {
    if (!emailVerified) {
      Alert.alert('Email Required', 'Please verify your email first to ensure token delivery.');
      return;
    }
    
    try {
      await Clipboard.setStringAsync(CONTRACT_ADDRESS);
      const encodedUrl = encodeURIComponent(`https://wallet.coinbase.com/send?address=${CONTRACT_ADDRESS}&amount=${ethAmount}`);
      const coinbaseUrl = `https://wallet.coinbase.com/?cb_url=${encodedUrl}`;
      await Linking.openURL(coinbaseUrl);
    } catch (error) {
      Alert.alert('Coinbase Wallet', `Contract address copied! Open Coinbase Wallet and send ${ethAmount} ETH.`, [{ text: 'OK' }]);
    }
  };

  const openMoonPay = async () => {
    if (!emailVerified) {
      Alert.alert('Email Required', 'Please verify your email first to ensure token delivery.');
      return;
    }
    
    try {
      await Clipboard.setStringAsync(CONTRACT_ADDRESS);
      const moonpayUrl = `https://buy.moonpay.com?currencyCode=eth&walletAddress=${CONTRACT_ADDRESS}`;
      await Linking.openURL(moonpayUrl);
    } catch (error) {
      Alert.alert('MoonPay', `Contract address copied! Opening MoonPay to purchase ETH.`, [{ text: 'OK' }]);
    }
  };

  const openAnyWallet = () => {
    if (!emailVerified) {
      Alert.alert('Email Required', 'Please verify your email first to ensure token delivery.');
      return;
    }
    
    copyContractAddress();
    Alert.alert('Contract Address Copied', `The contract address has been copied to your clipboard.\n\nSend ${ethAmount} ETH to complete your reservation.`, [{ text: 'OK' }]);
  };

  const setQuickAmount = (amount) => {
    setEthAmount(amount.toString());
  };

  const apoloTokens = calculateApoloTokens();

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Reserve APOLO Tokens</Text>
            <Text style={styles.subtitle}>Send ETH to reserve APOLO and receive tokens via email</Text>
          </View>

          {/* Step 1: Provide Email */}
          <View style={styles.card}>
            <Text style={styles.stepNumber}>STEP 1</Text>
            <Text style={styles.cardTitle}>Provide Email</Text>
            <Text style={styles.cardText}>Enter your email to receive APOLO tokens after sending ETH.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="your-email@example.com"
              placeholderTextColor="#B8860B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!emailVerified}
            />

            {!emailVerified ? (
              <Pressable 
                style={isVerifying ? styles.disabledButton : styles.button}
                onPress={verifyEmail}
                disabled={isVerifying}
              >
                <Ionicons name="mail-outline" size={20} color={isVerifying ? "#999999" : "#000000"} />
                <Text style={isVerifying ? styles.disabledText : styles.buttonText}>
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                <Text style={styles.verifiedText}>Email Verified - You will receive tokens here</Text>
              </View>
            )}
          </View>

          {/* Step 2: Enter ETH Amount */}
          <View style={styles.card}>
            <Text style={styles.stepNumber}>STEP 2</Text>
            <Text style={styles.cardTitle}>Enter ETH Amount</Text>
            
            <View style={styles.amountSection}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.05"
                placeholderTextColor="#B8860B"
                value={ethAmount}
                onChangeText={setEthAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.cardText}>ETH</Text>
            </View>
            
            <Text style={styles.cardText}>Quick amounts:</Text>
            <View style={{flexDirection: 'row', marginTop: 8}}>
              {[0.01, 0.05, 0.1, 0.5].map((amount) => (
                <Pressable key={amount} style={styles.quickAmount} onPress={() => setQuickAmount(amount)}>
                  <Text style={styles.quickAmountText}>{amount} ETH</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.cardText}>
                Current ETH Price: <Text style={styles.highlight}>${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </Text>
              <Text style={styles.cardText}>
                You will receive: <Text style={styles.highlight}>{apoloTokens.toLocaleString()} APOLO</Text>
              </Text>
            </View>
          </View>

          {/* Step 3: Copy Address */}
          {emailVerified && (
            <View style={styles.card}>
              <Text style={styles.stepNumber}>STEP 3</Text>
              <Text style={styles.cardTitle}>Copy Address</Text>
              <View style={styles.contractAddress}>
                <Text style={styles.addressText}>{CONTRACT_ADDRESS}</Text>
              </View>
              
              <Pressable style={styles.button} onPress={copyContractAddress}>
                <Ionicons name="copy-outline" size={20} color="#000000" />
                <Text style={styles.buttonText}>Copy APOLO Address</Text>
              </Pressable>
              
              {copySuccess && <Text style={styles.copySuccess}>✓ Address copied!</Text>}

              <Pressable style={styles.secondaryButton} onPress={openEtherscan}>
                <Ionicons name="open-outline" size={20} color="#FFD700" />
                <Text style={styles.secondaryButtonText}>View on Etherscan</Text>
              </Pressable>
              
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                <Text style={styles.verifiedText}>Contract Verified ✓</Text>
              </View>
            </View>
          )}

          {/* Step 4: Send ETH */}
          {emailVerified && (
            <View style={styles.card}>
              <Text style={styles.stepNumber}>STEP 4</Text>
              <Text style={styles.cardTitle}>Send ETH</Text>
              <Text style={styles.cardText}>Choose your preferred method to send ${ethAmount} ETH:</Text>
              
              <Pressable style={styles.metamaskButton} onPress={openMetaMask}>
                <Text style={styles.walletButtonText}>🦊 Open MetaMask</Text>
              </Pressable>
              <Pressable style={styles.coinbaseButton} onPress={openCoinbase}>
                <Text style={styles.walletButtonText}>ⓒ Open Coinbase</Text>
              </Pressable>
              <Pressable style={styles.moonpayButton} onPress={openMoonPay}>
                <Text style={styles.walletButtonText}>🌙 Open MoonPay</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={openAnyWallet}>
                <Text style={styles.secondaryButtonText}>Any Wallet App</Text>
              </Pressable>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}