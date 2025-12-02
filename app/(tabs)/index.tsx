// app/(tabs)/index.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, Image, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '../../services/useWeb3';
import { googleSheetsService } from '../../services/googleSheets';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [ethPrice, setEthPrice] = useState(2962.10);
  const { address, isConnected, formatAddress } = useWeb3();
  const router = useRouter();

  const fetchEthPrice = async () => {
    try {
      const price = await googleSheetsService.getEthPrice();
      setEthPrice(price);
    } catch (error) {
      console.log('Using cached ETH price');
    }
  };

  useEffect(() => {
    fetchEthPrice();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>APOLLO 18</Text>
          <Text style={styles.subtitle}>The Future of Digital Asset</Text>
        </View>

        {/* REMOVED: About APOLO section */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="rocket" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Spot Reservation</Text>
          </View>
          <Text style={styles.cardDescription}>
            Reserve your spot now during our earlier phase. 
          </Text>
          
          <Pressable 
            style={styles.button}
            onPress={() => router.push('/reserve')}
          >
            <Ionicons name="flash" size={20} color="#000000" />
            <Text style={styles.buttonText}>Reserve your spot</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Eth Address</Text>
          </View>
          <Text style={styles.cardDescription}>
            Our official Ethereum reserve address for spot reservations:
          </Text>
          
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>Eth address</Text>
          </View>

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
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="megaphone" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Stay Updated</Text>
          </View>
          <Text style={styles.cardDescription}>
            Join our waitlist to get early access, updates on token launch, and exclusive content. Currently, not avaialbe in China, Nepal, Algeria, Iraq, Bolivia, Egypt, Qatar, and Tunisia. 
          </Text>
          
          <Pressable 
            style={styles.secondaryButton}
            onPress={() => {
              Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSeCW_CPuL65ihBGFp8JfgLVouHXkA2PXybawotL8YL4JrJI5Q/viewform?usp=header')
                .catch(err => console.error('Failed to open URL:', err));
            }}
          >
            <Ionicons name="list" size={20} color="#FFD700" />
            <Text style={styles.secondaryButtonText}>Join Wait List</Text>
          </Pressable>
        </View>

        {isConnected && address && (
          <View style={styles.connectedCard}>
            <Ionicons name="checkmark-circle" size={20} color="#00FF00" />
            <Text style={styles.connectedText}>
              Wallet Connected: {formatAddress(address)}
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logo: { width: 80, height: 80, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, opacity: 0.8 },
  
  // ETH Price - CENTERED
  ethPriceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  ethPriceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  ethPrice: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshButtonText: {
    color: '#FFD700',
    fontSize: 14,
  },
  
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFD700' },
  cardDescription: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 16, opacity: 0.8 },
  button: { backgroundColor: '#FFD700', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700', alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  secondaryButtonText: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  addressContainer: { backgroundColor: '#2A2A2A', padding: 12, borderRadius: 8, marginBottom: 16 },
  addressText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'monospace', textAlign: 'center' },
  connectedCard: {
    backgroundColor: '#1A2A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00FF00'
  },
  connectedText: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: '500',
  },
});