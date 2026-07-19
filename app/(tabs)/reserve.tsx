// app/(tabs)/reserve.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

function ReserveScreenContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'checkout' | 'verify'>('email');
  const [hasRecordedTransaction, setHasRecordedTransaction] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const verifyEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsVerifying(true);
    try {
      await googleSheetsService.recordUserEmail({
        email: email.trim(),
        source: 'mobile-app'
      });
      Alert.alert('✅ Email Verified!', 'Please proceed to checkout.');
      setActiveTab('checkout');
    } catch (error) {
      setActiveTab('checkout');
    } finally {
      setIsVerifying(false);
    }
  };

  const proceedToPayment = async (amount: number) => {
    setIsRecording(true);
    try {
      // Simulate Stripe Payment Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await googleSheetsService.recordEnhancedTransaction({
        email: email,
        wallet: 'stripe_customer',
        ethAmount: '0',
        actualAmount: amount.toString(),
        txHash: 'stripe_' + Date.now(),
        fromAddress: 'STRIPE',
        usdAmount: amount.toString(),
        ethPrice: '0'
      });

      if (result.success) {
        setHasRecordedTransaction(true);
        setActiveTab('verify');
        Alert.alert('✅ Purchase Successful!', 'Access granted.');
      }
    } catch (error) {
      Alert.alert('Payment Failed', 'Transaction could not be completed.');
    } finally {
      setIsRecording(false);
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
            <Text style={styles.title}>Course Checkout</Text>
            <Text style={styles.subtitle}>Unlock Advanced Prompt Engineering Coursework</Text>
          </View>

          <View style={styles.progressContainer}>
            {['1', '2', '3'].map((step, index) => (
              <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                  styles.progressStep, 
                  (index === 0 && activeTab === 'email') ||
                  (index === 1 && activeTab === 'checkout') ||
                  (index === 2 && activeTab === 'verify') ? styles.progressStepActive : {}
                ]}>
                  <Text style={styles.progressText}>{step}</Text>
                </View>
                {index < 2 && <View style={styles.progressLine} />}
              </View>
            ))}
          </View>

          {(activeTab === 'email') && (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="mail" size={24} color="#D4AF37" />
                <Text style={styles.cardTitle}>Step 1: Verify Email</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Pressable style={styles.button} onPress={verifyEmail} disabled={isVerifying}>
                {isVerifying ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Start Enrollment</Text>}
              </Pressable>
            </View>
          )}

          {(activeTab === 'checkout') && (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color="#D4AF37" />
                <Text style={styles.cardTitle}>Step 2: Choose Package</Text>
              </View>

              {[
                { label: 'Basic Course', price: 99 },
                { label: 'Pro Bundle', price: 299 },
                { label: 'Enterprise Suite', price: 1499 }
              ].map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.packageCard}
                  onPress={() => proceedToPayment(item.price)}
                  disabled={isRecording}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.packageLabel}>{item.label}</Text>
                    <Text style={styles.packagePrice}>${item.price.toFixed(2)} USD</Text>
                  </View>
                  {isRecording ? <ActivityIndicator size="small" color="#D4AF37" /> : <Ionicons name="chevron-forward" size={20} color="#D4AF37" />}
                </Pressable>
              ))}
            </View>
          )}

          {(activeTab === 'verify') && (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#00A896" />
                <Text style={styles.cardTitle}>Step 3: Access Granted</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Enrollment Complete</Text>
                <Text style={styles.infoText}>Email: {email}</Text>
                <Text style={styles.infoText}>Status: Access Provisioned</Text>
              </View>
              <Pressable
                style={styles.button}
                onPress={() => router.push('/course')}
              >
                <Text style={styles.buttonText}>Go to Course Portal</Text>
              </Pressable>
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
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  progressStep: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2833', alignItems: 'center', justifyContent: 'center' },
  progressStepActive: { backgroundColor: '#D4AF37' },
  progressText: { color: '#FFFFFF', fontWeight: 'bold' },
  progressLine: { width: 30, height: 2, backgroundColor: '#1F2833', marginHorizontal: 8 },
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
  infoBox: { backgroundColor: 'rgba(0, 168, 150, 0.1)', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#00A896' },
  infoTitle: { color: '#00A896', fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#FFFFFF', fontSize: 14 },
});