// app/(tabs)/reserve.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { catalog, CatalogItem } from '../../data/catalog';
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
          <View style={styles.glassCard}>
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

// Redirects the browser (or opens the system browser on native) to a hosted
// checkout page outside our app — a real navigation away, not client routing.
async function goToExternalCheckout(url: string) {
  if (Platform.OS === 'web') {
    window.location.href = url;
  } else {
    await Linking.openURL(url);
  }
}

function ReserveScreenContent() {
  const { session, email: authedEmail, accessToken, signInWithEmail } = useAuth();
  const params = useLocalSearchParams<{ checkout?: string }>();
  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [payingSkuRail, setPayingSkuRail] = useState<string | null>(null);

  useEffect(() => {
    if (params.checkout === 'cancelled') {
      Alert.alert('Checkout Cancelled', 'No charge was made.');
    }
  }, [params.checkout]);

  const sendMagicLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSendingLink(true);
    try {
      const { error } = await signInWithEmail(email.trim());
      if (error) {
        Alert.alert('Could Not Send Link', error);
      } else {
        setLinkSent(true);
      }
    } finally {
      setIsSendingLink(false);
    }
  };

  const startCheckout = async (item: CatalogItem, rail: 'card' | 'eth') => {
    if (!accessToken) {
      Alert.alert('Sign In Required', 'Please verify your email first.');
      return;
    }

    setPayingSkuRail(`${item.sku}:${rail}`);
    try {
      const endpoint = rail === 'card' ? '/api/checkout' : '/api/eth-checkout';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sku: item.sku }),
      });

      const json = await response.json();
      if (!response.ok || !json.url) {
        throw new Error(json.error || 'Checkout could not be started');
      }

      await goToExternalCheckout(json.url);
    } catch (error: any) {
      Alert.alert('Checkout Failed', error?.message || 'Please try again.');
    } finally {
      setPayingSkuRail(null);
    }
  };

  const signedIn = !!session;

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
            <Text style={styles.title}>Pricing</Text>
            <Text style={styles.subtitle}>Unlock courses and top up your Apollo18 Credits</Text>
          </View>

          {!signedIn ? (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="mail" size={24} color="#D4AF37" />
                <Text style={styles.cardTitle}>Sign In to Continue</Text>
              </View>
              {linkSent ? (
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Check Your Email</Text>
                  <Text style={styles.infoText}>
                    We sent a sign-in link to {email}. Open it on this device to continue.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.cardDescription}>
                    We'll email you a one-time sign-in link — no password needed.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#666666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Pressable style={styles.button} onPress={sendMagicLink} disabled={isSendingLink}>
                    {isSendingLink ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Send Sign-In Link</Text>}
                  </Pressable>
                </>
              )}
            </View>
          ) : (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color="#D4AF37" />
                <Text style={styles.cardTitle}>Choose Package</Text>
              </View>
              <Text style={styles.cardDescription}>Signed in as {authedEmail}</Text>

              {catalog.filter((item) => !item.comingSoon).map((item) => {
                const cardBusy = payingSkuRail === `${item.sku}:card`;
                const ethBusy = payingSkuRail === `${item.sku}:eth`;
                const anyBusy = payingSkuRail !== null;

                return (
                  <View key={item.sku} style={styles.packageCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.packageLabel}>{item.title}</Text>
                      <Text style={styles.packagePrice}>
                        ${item.priceUsd.toFixed(2)} USD
                        {item.type === 'credits' ? ` · ${item.credits.toLocaleString()} credits` : ''}
                      </Text>
                    </View>
                    <View style={styles.railButtons}>
                      <Pressable
                        style={styles.railButton}
                        onPress={() => startCheckout(item, 'card')}
                        disabled={anyBusy}
                      >
                        {cardBusy ? <ActivityIndicator size="small" color="#D4AF37" /> : <Ionicons name="card-outline" size={18} color="#D4AF37" />}
                      </Pressable>
                      <Pressable
                        style={styles.railButton}
                        onPress={() => startCheckout(item, 'eth')}
                        disabled={anyBusy}
                      >
                        {ethBusy ? <ActivityIndicator size="small" color="#D4AF37" /> : <Ionicons name="logo-bitcoin" size={18} color="#D4AF37" />}
                      </Pressable>
                    </View>
                  </View>
                );
              })}
              <Text style={styles.railHint}>Card = pay by credit/debit. Coin icon = pay with ETH.</Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function ReserveScreen() {
  return (
    <ErrorBoundary>
      <ReserveScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C10' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 32 },
  logo: { width: 80, height: 80, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#C5C6C7', textAlign: 'center', marginTop: 8 },
  glassCard: {
    backgroundColor: 'rgba(31, 40, 51, 0.7)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37' },
  cardDescription: { fontSize: 14, color: '#C5C6C7', marginBottom: 16 },
  input: { backgroundColor: '#1F2833', borderRadius: 12, padding: 16, color: '#FFFFFF', marginBottom: 16, borderWidth: 1, borderColor: '#D4AF37' },
  button: { backgroundColor: '#D4AF37', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2833',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)'
  },
  packageLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  packagePrice: { color: '#D4AF37', fontSize: 14, marginTop: 4 },
  railButtons: { flexDirection: 'row', gap: 8 },
  railButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#0B0C10', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  railHint: { color: '#C5C6C7', fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.7 },
  infoBox: { backgroundColor: 'rgba(0, 168, 150, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#00A896' },
  infoTitle: { color: '#00A896', fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#FFFFFF', fontSize: 14 },
});
