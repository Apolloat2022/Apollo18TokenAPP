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
  // ... ALL YOUR EXISTING STYLES (copy everything from your current file)
});

export default function HomeScreen() {
  const router = useRouter();
  const [ethPrice, setEthPrice] = useState(3419.59);
  const [ethAmount, setEthAmount] = useState('0.05');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadEthPrice();
  }, []);

  const loadEthPrice = async () => {
    // ... YOUR EXISTING loadEthPrice FUNCTION
  };

  const calculateApoloTokens = () => {
    // ... YOUR EXISTING calculateApoloTokens FUNCTION
  };

  const copyContractAddress = async () => {
    // ... YOUR EXISTING copyContractAddress FUNCTION
  };

  const openWaitlistForm = () => {
    // ... YOUR EXISTING openWaitlistForm FUNCTION
  };

  const setQuickAmount = (amount) => {
    // ... YOUR EXISTING setQuickAmount FUNCTION
  };

  const navigateToReserve = () => {
    router.push('/reserve');
  };

  const apoloTokens = calculateApoloTokens();
  const usdValue = (parseFloat(ethAmount) || 0) * ethPrice;

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

        {/* ... ALL YOUR EXISTING JSX CODE */}
        
        {/* Live ETH Price Card */}
        <View style={styles.card}>
          {/* ... your existing price card content */}
        </View>

        {/* Contract Address Card */}
        <View style={styles.card}>
          {/* ... your existing contract address content */}
        </View>

        {/* Token Price & Calculation Card */}
        <View style={styles.card}>
          {/* ... your existing token price content */}
        </View>

        {/* Reserve Section Card */}
        <View style={styles.card}>
          {/* ... your existing reserve content */}
        </View>

        {/* Waitlist Section Card */}
        <View style={styles.card}>
          {/* ... your existing waitlist content */}
        </View>

        {/* Quick Actions Card */}
        <View style={styles.card}>
          {/* ... your existing quick actions content */}
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