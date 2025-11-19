import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, Linking, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { googleSheetsService } from '../../services/googleSheets';
import { googleFormsService } from '../../services/googleForms';
import { tokenContractService } from '../../services/tokenContract';
import { walletService } from '../../services/walletService';

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
  logo: {
    width: 60,
    height: 61,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8860B',
    textAlign: 'center',
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
  },
  highlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  ethPrice: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  refreshText: {
    fontSize: 12,
    color: '#B8860B',
    textAlign: 'center',
    textDecorationLine: 'underline',
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
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  infoBox: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  copySuccess: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
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
    borderWidth: 1,
    borderColor: '#FFD700',
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
  disclaimer: {
    fontSize: 12,
    color: '#B8860B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  exampleText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#B8860B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

const CONTRACT_ADDRESS = '0x0e3541725230432653A9a3F65eB5591D16822de0';

// Live ETH price fetcher using CoinGecko API
const fetchLiveETHPrice = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    throw error;
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [ethPrice, setEthPrice] = useState(null);
  const [ethAmount, setEthAmount] = useState('0.05');
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEthPrice();
  }, []);

  const loadEthPrice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try multiple sources for ETH price
      let price = null;
      
      // First try: Direct API call
      try {
        price = await fetchLiveETHPrice();
      } catch (apiError) {
        console.log('Direct API failed, trying Google Sheets service...');
        
        // Second try: Google Sheets service (your original method)
        try {
          price = await googleSheetsService.getEthPrice();
        } catch (sheetsError) {
          console.log('Google Sheets service also failed');
          throw new Error('All price sources failed');
        }
      }
      
      if (price) {
        setEthPrice(price);
      } else {
        throw new Error('No price data received');
      }
    } catch (error) {
      console.error('Error loading ETH price:', error);
      setError('Failed to load ETH price. Please try again.');
      // Set a reasonable fallback price
      setEthPrice(2900);
    } finally {
      setLoading(false);
    }
  };

  const calculateApoloTokens = () => {
    const currentEthPrice = ethPrice || 2900; // Use current price or fallback
    return tokenContractService.calculateApoloTokens(parseFloat(ethAmount) || 0, currentEthPrice);
  };

  const openWaitlistForm = () => {
    Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSeCW_CPuL65ihBGFp8JfgLVouHXkA2PXybawotL8YL4JrJI5Q/viewform');
  };

  const setQuickAmount = (amount) => {
    setEthAmount(amount.toString());
  };

  const navigateToReserve = () => {
    router.push('/reserve');
  };

  const openEtherscan = () => {
    Linking.openURL(`https://etherscan.io/address/${CONTRACT_ADDRESS}`);
  };

  const apoloTokens = calculateApoloTokens();
  const currentEthPrice = ethPrice || 2900;
  const usdValue = (parseFloat(ethAmount) || 0) * currentEthPrice;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.title}>APOLLO 18</Text>
          <Text style={styles.subtitle}>$APOLO Token - Phase 11</Text>
        </View>

        {/* Live ETH Price Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live ETH Price</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Loading ETH price...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.ethPrice}>${currentEthPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          )}
          
          <Pressable onPress={loadEthPrice} disabled={loading}>
            <Text style={[styles.refreshText, loading && { opacity: 0.5 }]}>
              {loading ? 'Loading...' : '↻ Refresh Price'}
            </Text>
          </Pressable>
        </View>

        {/* Reserve Section Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reserve Apollo 18</Text>
          <Text style={styles.cardText}>
            Send ETH to the contract address to reserve your APOLO tokens.{'\n'}
            Your deposits are automatically tracked in our system.
          </Text>
          <Pressable style={styles.button} onPress={navigateToReserve}>
            <Ionicons name="arrow-forward-outline" size={20} color="#000000" />
            <Text style={styles.buttonText}>Reserve Apollo 18</Text>
          </Pressable>
        </View>

        {/* Token Price & Calculation Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Token Price</Text>
          <Text style={styles.cardText}>
            <Text style={styles.highlight}>$1 = 100,000 APOLO</Text>
          </Text>
          <Text style={styles.cardText}>
            Send ETH to contract → Receive APOLO at launch
          </Text>
          
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
          
          <Text style={styles.cardText}>Quick amounts:</Text>
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

          <View style={styles.infoBox}>
            <Text style={styles.cardText}>
              You will receive: <Text style={styles.highlight}>{apoloTokens.toLocaleString()} APOLO</Text>
            </Text>
            <Text style={styles.exampleText}>
              (${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} at current price)
            </Text>
          </View>
        </View>

        {/* Waitlist Section Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join Waitlist</Text>
          <Text style={styles.cardText}>
            Get early access and updates about the APOLO token launch.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={openWaitlistForm}>
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>Join Waitlist</Text>
          </Pressable>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <Pressable style={styles.secondaryButton} onPress={openEtherscan}>
            <Ionicons name="open-outline" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>View on Etherscan</Text>
          </Pressable>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Not available in the U.S. • ERC-20 Token{'\n'}
          Send ETH directly to contract address above
        </Text>
      </ScrollView>
    </View>
  );
}