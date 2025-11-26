// app/(tabs)/index.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Image, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useWeb3 } from '../../services/useWeb3';
import * as Linking from 'expo-linking';

export default function HomeScreen() {
  const [ethPrice, setEthPrice] = useState(2962.10);
  const [refreshing, setRefreshing] = useState(false);
  const [ethAmount, setEthAmount] = useState('0.05');
  const { address, isConnected, formatAddress } = useWeb3();

  const refreshPrice = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEthPrice(2962.10);
    } catch (error) {
      console.error('Error refreshing price:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateTokens = (amount: number) => {
    const usdValue = amount * ethPrice;
    return Math.floor(usdValue * 100000);
  };

  const quickAmounts = [0.01, 0.05, 0.1, 0.5];

  const handleQuickAmount = (amount: number) => {
    setEthAmount(amount.toString());
  };

  const openEtherscan = () => {
    Linking.openURL('https://etherscan.io/address/0x0e3541725230432653A9a3F65eB5591D16822de0');
  };

  const calculatedTokens = calculateTokens(parseFloat(ethAmount) || 0);
  const usdValue = (parseFloat(ethAmount) || 0) * ethPrice;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>APOLLO 18</Text>
          <Text style={styles.subtitle}>$APOLO Token - Phase 11</Text>
        </View>

        {/* ETH Price Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live ETH Price</Text>
          <Text style={styles.ethPrice}>${ethPrice.toLocaleString()}</Text>
          <Pressable style={styles.refreshButton} onPress={refreshPrice} disabled={refreshing}>
            <Ionicons name="refresh" size={16} color="#FFD700" />
            <Text style={styles.refreshText}>
              {refreshing ? 'Refreshing...' : 'Refresh Price'}
            </Text>
          </Pressable>
        </View>

        {/* Reserve Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reserve Apollo 18</Text>
          <Text style={styles.cardDescription}>
            Send ETH to the contract address to reserve your APOLO tokens.
            Your deposits are automatically tracked in our system.
          </Text>
          <Link href="/(tabs)/reserve" asChild>
            <Pressable style={styles.button}>
              <Ionicons name="arrow-forward" size={20} color="#000000" />
              <Text style={styles.buttonText}>Reserve Apollo 18</Text>
            </Pressable>
          </Link>
        </View>

        {/* Token Price Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Token Price</Text>
          <Text style={styles.tokenRate}>$1 = 100,000 APOLO</Text>
          <Text style={styles.cardDescription}>
            Send ETH to contract → Receive APOLO at launch
          </Text>

          <View style={styles.ethAmountContainer}>
            <TextInput
              style={styles.ethAmountInput}
              value={ethAmount}
              onChangeText={setEthAmount}
              keyboardType="decimal-pad"
              placeholder="0.05"
              placeholderTextColor="#888888"
            />
            <Text style={styles.ethLabel}>ETH</Text>
          </View>

          <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map((amount) => (
              <Pressable 
                key={amount} 
                style={[
                  styles.quickAmountButton,
                  ethAmount === amount.toString() && styles.quickAmountButtonActive
                ]} 
                onPress={() => handleQuickAmount(amount)}
              >
                <Text style={styles.quickAmountText}>{amount} ETH</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.tokensCalculation}>
            <Text style={styles.tokensLabel}>You will receive:</Text>
            <Text style={styles.tokensAmount}>
              {calculatedTokens.toLocaleString()} APOLO
            </Text>
            <Text style={styles.tokensValue}>
              (${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} at current price)
            </Text>
          </View>
        </View>

        {/* Waitlist Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join Waitlist</Text>
          <Text style={styles.cardDescription}>
            Get early access and updates about the APOLO token launch.
          </Text>
          <Pressable style={styles.secondaryButton}>
            <Ionicons name="mail-outline" size={20} color="#FFD700" />
            <Text style={styles.secondaryButtonText}>Join Waitlist</Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <Pressable style={styles.linkButton} onPress={openEtherscan}>
            <Ionicons name="open-outline" size={16} color="#FFD700" />
            <Text style={styles.linkButtonText}>View on Etherscan</Text>
          </Pressable>
          
          <View style={styles.legalNotice}>
            <Text style={styles.legalText}>Not available in the U.S. • ERC-20 Token</Text>
            <Text style={styles.legalText}>Send ETH directly to contract address above</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', opacity: 0.8 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 16, opacity: 0.8 },
  ethPrice: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshText: { color: '#FFD700', fontSize: 14 },
  button: { backgroundColor: '#FFD700', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: 'transparent', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryButtonText: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  tokenRate: { fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginBottom: 8 },
  ethAmountContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2A2A2A', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 12 
  },
  ethAmountInput: { 
    flex: 1, 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold',
    padding: 0,
  },
  ethLabel: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quickAmountsLabel: { color: '#888888', fontSize: 12, marginBottom: 8 },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quickAmountButton: { backgroundColor: '#2A2A2A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  quickAmountButtonActive: { backgroundColor: '#FFD700' },
  quickAmountText: { color: '#FFFFFF', fontSize: 12 },
  quickAmountButtonActiveText: { color: '#000000' },
  tokensCalculation: { backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8 },
  tokensLabel: { color: '#888888', fontSize: 12, marginBottom: 4 },
  tokensAmount: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  tokensValue: { color: '#888888', fontSize: 12 },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  linkButtonText: { color: '#FFD700', fontSize: 14 },
  legalNotice: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#333333' },
  legalText: { color: '#666666', fontSize: 12, textAlign: 'center', marginBottom: 4 },
});