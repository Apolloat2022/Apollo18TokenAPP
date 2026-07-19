// app/(tabs)/profile.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { SignInPanel } from '../../components/SignInPanel';
import { fetchDashboard, Purchase } from '../../services/api';
import { notify } from '../../services/notify';

function processorLabel(p: Purchase['processor']) {
  return p === 'stripe' ? 'Card' : 'ETH';
}

export default function DashboardScreen() {
  const { isSignedIn, email, getToken, signOut } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ checkout?: string }>();

  const [balance, setBalance] = useState<number | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const loadDashboard = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoadingData(true);
    try {
      const data = await fetchDashboard(token);
      setBalance(data.balance);
      setPurchases(data.purchases);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoadingData(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn) loadDashboard();
  }, [isSignedIn, loadDashboard]);

  useEffect(() => {
    if (params.checkout === 'success') {
      notify('✅ Purchase Successful', 'Your credits or course access will appear below shortly.');
      if (isSignedIn) loadDashboard();
    } else if (params.checkout === 'cancelled') {
      notify('Checkout Cancelled', 'No charge was made.');
    }
  }, [params.checkout, isSignedIn, loadDashboard]);

  const contactEmail = () => Linking.openURL('mailto:Info@apollo18token.com');
  const contactPhone = () => Linking.openURL('tel:+14695509909');

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
          <Text style={styles.subtitle}>DASHBOARD</Text>
        </View>

        {!isSignedIn ? (
          <SignInPanel />
        ) : (
          <>
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="flash" size={24} color="#D4AF37" />
                <Text style={styles.cardTitle}>Credit Balance</Text>
              </View>
              {loadingData ? (
                <ActivityIndicator color="#D4AF37" />
              ) : (
                <Text style={styles.balanceText}>{(balance ?? 0).toLocaleString()} credits</Text>
              )}
              <Text style={styles.paragraph}>Signed in as {email}</Text>
              <Pressable style={styles.button} onPress={() => router.push('/pricing')}>
                <Ionicons name="add-circle-outline" size={18} color="#000000" />
                <Text style={styles.buttonText}> Buy More</Text>
              </Pressable>
            </View>

            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="receipt" size={24} color="#D4AF37" />
                <Text style={styles.cardTitle}>Purchase History</Text>
              </View>
              {purchases.length === 0 && !loadingData ? (
                <Text style={styles.paragraph}>No purchases yet.</Text>
              ) : (
                purchases.map((p) => (
                  <View key={p.id} style={styles.purchaseRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.purchaseSku}>{p.sku}</Text>
                      <Text style={styles.purchaseDate}>{new Date(p.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.purchaseAmount}>${Number(p.amount_usd).toFixed(2)}</Text>
                    <Text style={styles.purchaseRail}>{processorLabel(p.processor)}</Text>
                  </View>
                ))
              )}
            </View>

            <Pressable style={styles.secondaryButton} onPress={signOut}>
              <Ionicons name="log-out-outline" size={18} color="#D4AF37" />
              <Text style={styles.secondaryButtonText}>Sign Out</Text>
            </Pressable>
          </>
        )}

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Pressable style={styles.contactButton} onPress={contactEmail}>
            <Ionicons name="mail" size={16} color="#D4AF37" />
            <Text style={styles.contactText}>Info@apollo18token.com</Text>
          </Pressable>
          <Pressable style={styles.contactButton} onPress={contactPhone}>
            <Ionicons name="call" size={16} color="#D4AF37" />
            <Text style={styles.contactText}>+1 469-550-9909</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Apollo Technologies US. All rights reserved.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C10' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 32 },
  logo: { width: 80, height: 80, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#C5C6C7', textAlign: 'center', letterSpacing: 2 },
  section: { marginBottom: 32, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  paragraph: { fontSize: 14, color: '#C5C6C7', lineHeight: 22, marginBottom: 12 },
  glassCard: { backgroundColor: 'rgba(31, 40, 51, 0.7)', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37' },
  balanceText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  button: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#000000', fontSize: 15, fontWeight: 'bold' },
  secondaryButton: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D4AF37', marginBottom: 20 },
  secondaryButtonText: { color: '#D4AF37', fontSize: 15, fontWeight: 'bold' },
  purchaseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(197, 198, 199, 0.1)' },
  purchaseSku: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  purchaseDate: { color: '#C5C6C7', fontSize: 12, marginTop: 2 },
  purchaseAmount: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginRight: 10 },
  purchaseRail: { color: '#00A896', fontSize: 11, fontWeight: 'bold', backgroundColor: 'rgba(0, 168, 150, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  contactButton: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, padding: 16, backgroundColor: '#1F2833', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
  contactText: { color: '#D4AF37', fontSize: 14, fontWeight: '500' },
  footer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1F2833' },
  footerText: { fontSize: 11, color: '#45A29E', textAlign: 'center' },
});
