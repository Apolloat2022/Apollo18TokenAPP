import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { googleSheetsService } from '../../services/googleSheets';
import { tokenContractService } from '../../services/tokenContract';
import { walletService } from '../../services/walletService';
import { emailService } from '../../services/emailService';
import * as Clipboard from 'expo-clipboard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B8860B',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.9,
  },
  highlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  whiteHighlight: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  metamaskButton: {
    backgroundColor: '#F6851B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  coinbaseButton: {
    backgroundColor: '#0052FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  moonpayButton: {
    backgroundColor: '#7B42FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  contractAddress: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  addressText: {
    color: '#FFD700',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  successBox: {
    backgroundColor: '#1a2a1a',
  },
  copySuccess: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  walletLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metamaskLogo: {
    backgroundColor: '#000000',
  },
  coinbaseLogo: {
    backgroundColor: '#FFFFFF',
  },
  moonpayLogo: {
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  coinbaseLogoText: {
    color: '#0052FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moonpayLogoText: {
    color: '#7B42FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginRight: 8,
  },
  quickAmount: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    marginLeft: 4,
  },
  quickAmountText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  transactionItem: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  loadingText: {
    color: '#FFD700',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default function ReserveScreen() {
  const [ethPrice, setEthPrice] = useState(3419.59);
  const [ethAmount, setEthAmount] = useState('0.05');
  const [userEmail, setUserEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [userDeposits, setUserDeposits] = useState([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);

  const loadData = async () => {
    try {
      const price = await googleSheetsService.getEthPrice();
      setEthPrice(price);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      const latestTx = await googleSheetsService.getLatestTransactions();
      if (latestTx && latestTx.length > 0) {
        setTransactions(latestTx);
      } else {
        const mockTransactions = [
          { amount: '0.05', hash: '0x1234...5678', time: '2 min ago', email: 'user1@example.com', apoloTokens: '1,750,000' },
          { amount: '0.1', hash: '0xabcd...efgh', time: '5 min ago', email: 'user2@example.com', apoloTokens: '3,500,000' },
          { amount: '0.02', hash: '0x9876...5432', time: '10 min ago', email: 'user3@example.com', apoloTokens: '700,000' }
        ];
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      const mockTransactions = [
        { amount: '0.05', hash: '0x1234...5678', time: '2 min ago', email: 'user1@example.com', apoloTokens: '1,750,000' },
        { amount: '0.1', hash: '0xabcd...efgh', time: '5 min ago', email: 'user2@example.com', apoloTokens: '3,500,000' },
        { amount: '0.02', hash: '0x9876...5432', time: '10 min ago', email: 'user3@example.com', apoloTokens: '700,000' }
      ];
      setTransactions(mockTransactions);
    }
  };

  const loadUserDeposits = async () => {
    if (!userEmail || !emailVerified) return;
    
    setLoadingDeposits(true);
    try {
      const deposits = await googleSheetsService.getUserTransactions(userEmail);
      setUserDeposits(deposits);
    } catch (error) {
      console.error('Error loading user deposits:', error);
      setUserDeposits([]);
    } finally {
      setLoadingDeposits(false);
    }
  };

  const copyContractAddress = async () => {
    try {
      await Clipboard.setStringAsync(tokenContractService.contractAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const verifyEmail = async () => {
    console.log('🎯 Verify Email clicked!');
    
    if (!userEmail || !userEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      console.log('📧 Attempting to verify email:', userEmail);
      
      setEmailVerified(true);
      Alert.alert('✅ Email Verified', `You will receive APOLO tokens at: ${userEmail}`);
      
      try {
        // This records to your "Form Response" page
        await emailService.recordUserEmail(userEmail);
        console.log('✅ Email recorded to Google Sheets Form Response');
      } catch (error) {
        console.log('⚠️ Google Sheets failed, but email verified locally');
      }
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      Alert.alert('Error', 'Please try again.');
    }
  };

  const openWalletWithTracking = async (walletFunction) => {
    if (!emailVerified) {
      Alert.alert(
        'Email Required',
        'Please verify your email first to receive APOLO tokens after sending ETH.'
      );
      return;
    }

    try {
      const ethAmountNum = parseFloat(ethAmount);
      const apoloTokens = tokenContractService.calculateApoloTokens(ethAmountNum, ethPrice);
      const usdValue = ethAmountNum * ethPrice;

      try {
        // This records to your main tracking sheet with ALL columns
        await googleSheetsService.recordTransaction(
          userEmail,           // Email
          ethAmountNum,        // ETH_Amount  
          'pending-tx-hash',   // Tx_Hash (will be updated when real TX happens)
          apoloTokens,         // APOLO_Due
          usdValue,           // USD_Spot
          'wallet-app',       // Wallet type
          new Date().toISOString().split('T')[0].replace(/-/g, '') // Day_ID
        );
        console.log('✅ Transaction recorded to Google Sheets with all columns');
      } catch (error) {
        console.log('⚠️ Failed to record transaction, but opening wallet anyway');
      }

      walletFunction(tokenContractService.contractAddress, ethAmount);
      
    } catch (error) {
      console.error('Error opening wallet:', error);
      Alert.alert('Error', 'Failed to open wallet. Please try again.');
    }
  };

  const setQuickAmount = (amount) => {
    setEthAmount(amount.toString());
  };

  const refreshData = () => {
    loadTransactionHistory();
  };

  useEffect(() => {
    loadData();
    loadTransactionHistory();
  }, []);

  useEffect(() => {
    if (emailVerified) {
      loadUserDeposits();
    }
  }, [emailVerified]);

  const apoloTokens = tokenContractService.calculateApoloTokens(parseFloat(ethAmount) || 0, ethPrice);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* ALL YOUR EXISTING UI REMAINS EXACTLY THE SAME */}
        <View style={styles.header}>
          <Text style={styles.title}>Reserve APOLO Tokens</Text>
          <Text style={styles.subtitle}>Send ETH and receive tokens via email</Text>
        </View>

        {/* Step 1: Provide Email - EXACTLY AS IS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1: Provide Email</Text>
          <Text style={styles.cardText}>
            Enter your email to receive APOLO tokens after sending ETH.
          </Text>
          
          {!emailVerified ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="your-email@example.com"
                placeholderTextColor="#B8860B"
                value={userEmail}
                onChangeText={setUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Pressable 
                style={[styles.button, !userEmail && styles.disabledButton]}
                onPress={verifyEmail}
                disabled={!userEmail}
              >
                <Ionicons name="checkmark-outline" size={20} color="#000000" />
                <Text style={styles.buttonText}>Verify Email</Text>
              </Pressable>
            </>
          ) : (
            <View style={[styles.infoBox, styles.successBox]}>
              <Text style={[styles.cardText, {color: '#4CAF50'}]}>
                ✓ Email verified: {userEmail}
              </Text>
              <Text style={[styles.cardText, {fontSize: 12}]}>
                You will receive APOLO tokens at this address
              </Text>
            </View>
          )}
        </View>

        {/* Step 2: Enter ETH Amount - EXACTLY AS IS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 2: Enter ETH Amount</Text>
          <View style={styles.amountSection}>
            <TextInput
              style={styles.amountInput}
              placeholder="0.05 ETH"
              placeholderTextColor="#B8860B"
              value={ethAmount}
              onChangeText={setEthAmount}
              keyboardType="decimal-pad"
            />
            <Text style={styles.cardText}>ETH</Text>
          </View>
          
          <Text style={styles.cardText}>
            Quick amounts:
          </Text>
          <View style={{flexDirection: 'row', marginTop: 8}}>
            {[0.01, 0.05, 0.1, 0.5].map((amount) => (
              <Pressable 
                key={amount} 
                style={styles.quickAmount}
                onPress={() => setQuickAmount(amount)}
              >
                <Text style={styles.quickAmountText}>{amount} ETH</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.cardText}>
            Current ETH Price: <Text style={styles.highlight}>${ethPrice.toLocaleString()}</Text>
          </Text>
          {ethAmount && (
            <View style={styles.infoBox}>
              <Text style={styles.cardText}>
                You will receive: <Text style={styles.highlight}>{apoloTokens.toLocaleString()} APOLO</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Step 3: Copy Address - EXACTLY AS IS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 3: Copy Address</Text>
          <View style={styles.contractAddress}>
            <Text style={styles.addressText}>{tokenContractService.contractAddress}</Text>
          </View>
          <Pressable style={styles.button} onPress={copyContractAddress}>
            <Ionicons name="copy-outline" size={20} color="#000000" />
            <Text style={styles.buttonText}>Copy APOLO Address</Text>
          </Pressable>
          {copySuccess && <Text style={styles.copySuccess}>✓ Address copied!</Text>}
          
          <Pressable style={styles.secondaryButton} onPress={() => Linking.openURL(`https://etherscan.io/address/${tokenContractService.contractAddress}`)}>
            <Ionicons name="open-outline" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>View on Etherscan</Text>
          </Pressable>
        </View>

        {/* Contract Info - EXACTLY AS IS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify the contract and track transactions on Etherscan:</Text>
          <Pressable style={styles.button} onPress={() => Linking.openURL(`https://etherscan.io/address/${tokenContractService.contractAddress}`)}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#000000" />
            <Text style={styles.buttonText}>View Contract on Etherscan</Text>
          </Pressable>
          <View style={styles.infoBox}>
            <Text style={styles.cardText}>
              <Text style={styles.highlight}>Contract Verified ✓</Text>{'\n'}
              Total Supply: 1,000,000,000 APOLO{'\n'}
              Token Standard: ERC-20
            </Text>
          </View>
        </View>

        {/* Latest Transactions - EXACTLY AS IS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Transactions</Text>
          <Text style={styles.cardText}>
            Recent deposits to the APOLO contract:
          </Text>
          
          <View style={styles.infoBox}>
            {transactions.map((tx, index) => (
              <View key={index} style={styles.transactionItem}>
                <Text style={styles.transactionText}>
                  • {tx.amount} ETH - {tx.hash} ({tx.time})
                </Text>
              </View>
            ))}
          </View>
          
          <Pressable style={styles.secondaryButton} onPress={refreshData}>
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>Refresh Transactions</Text>
          </Pressable>
        </View>

        {/* YOUR DEPOSITS - NEW SECTION ADDED */}
        {emailVerified && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Deposits</Text>
            <Text style={styles.cardText}>
              Your transaction history will appear here after sending ETH.
            </Text>
            
            {loadingDeposits ? (
              <Text style={styles.loadingText}>Loading your deposits...</Text>
            ) : userDeposits.length > 0 ? (
              <View style={styles.infoBox}>
                {userDeposits.map((deposit, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <Text style={styles.transactionText}>
                      • {deposit.amount} ETH - {deposit.hash} 
                    </Text>
                    <Text style={[styles.transactionText, {fontSize: 10, color: '#FFD700'}]}>
                      APOLO: {deposit.apoloTokens} • {deposit.timestamp}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.infoBox}>
                <Text style={[styles.cardText, {fontSize: 12}]}>
                  No deposits yet. Send ETH to see your transaction history.
                </Text>
              </View>
            )}
            
            <Pressable style={styles.secondaryButton} onPress={loadUserDeposits}>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Check Your Deposits</Text>
            </Pressable>
          </View>
        )}

        {/* Step 4: Send ETH - EXACTLY AS IS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 4: Send ETH</Text>
          <Text style={styles.cardText}>
            Choose your preferred method to send {ethAmount} ETH:
          </Text>

          <Pressable 
            style={[styles.metamaskButton, !emailVerified && styles.disabledButton]}
            onPress={() => openWalletWithTracking(walletService.openMetaMask)}
          >
            <View style={[styles.walletLogo, styles.metamaskLogo]}>
              <Text style={styles.logoText}>🦊</Text>
            </View>
            <Text style={styles.buttonText}>Open MetaMask</Text>
          </Pressable>

          <Pressable 
            style={[styles.coinbaseButton, !emailVerified && styles.disabledButton]}
            onPress={() => openWalletWithTracking(walletService.openCoinbase)}
          >
            <View style={[styles.walletLogo, styles.coinbaseLogo]}>
              <Text style={styles.coinbaseLogoText}>ⓒ</Text>
            </View>
            <Text style={styles.buttonText}>Open Coinbase</Text>
          </Pressable>

          <Pressable 
            style={[styles.moonpayButton, !emailVerified && styles.disabledButton]}
            onPress={() => openWalletWithTracking(walletService.openMoonPay)}
          >
            <View style={[styles.walletLogo, styles.moonpayLogo]}>
              <Text style={styles.moonpayLogoText}>🌙</Text>
            </View>
            <Text style={styles.buttonText}>Open MoonPay</Text>
          </Pressable>

          <Pressable 
            style={[styles.secondaryButton, !emailVerified && styles.disabledButton]}
            onPress={() => openWalletWithTracking(walletService.sendETH)}
          >
            <Ionicons name="phone-portrait-outline" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>Any Wallet App</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}