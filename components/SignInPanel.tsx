// components/SignInPanel.tsx
// Email-code sign-in/sign-up, encapsulating Clerk's two-step flow so screens
// (Pricing, Dashboard) can just render <SignInPanel/> when signed out.
//
// NOTE: the exact Clerk email-code API calls below follow Clerk's documented
// Expo pattern but have NOT been exercised against a live Clerk instance yet —
// verify this flow end-to-end during the first live test (see PHASE2-HANDOFF).
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useAuth } from '../hooks/useAuth';
import { notify } from '../services/notify';

function ClerkEmailCodeFlow() {
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      notify('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!signInLoaded || !signUpLoaded) return;

    setBusy(true);
    try {
      try {
        // Existing user path.
        const si = await signIn.create({ identifier: email.trim() });
        const factor = si.supportedFirstFactors?.find((f) => f.strategy === 'email_code');
        // The email_code factor carries an emailAddressId; Clerk's union type
        // doesn't narrow cleanly here, so read it defensively.
        const emailAddressId = (factor as any)?.emailAddressId;
        if (!emailAddressId) throw new Error('no email_code factor');
        await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId });
        setMode('signIn');
      } catch {
        // New user path.
        await signUp.create({ emailAddress: email.trim() });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setMode('signUp');
      }
      setStage('code');
    } catch (err: any) {
      notify('Could Not Send Code', err?.errors?.[0]?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    // Clerk's email template often displays the code with a space in the
    // middle for readability (e.g. "123 456"). .trim() only strips leading/
    // trailing whitespace, so a copy-pasted code with an internal space would
    // reach Clerk malformed and get rejected every time. Strip everything but
    // digits instead.
    const cleanCode = code.replace(/\D/g, '');
    if (!cleanCode) {
      notify('Enter Code', 'Please enter the code from your email.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signIn') {
        const res = await signIn.attemptFirstFactor({ strategy: 'email_code', code: cleanCode });
        if (res.status === 'complete') {
          await setActiveSignIn({ session: res.createdSessionId });
        } else {
          throw new Error('Sign-in not complete');
        }
      } else {
        const res = await signUp.attemptEmailAddressVerification({ code: cleanCode });
        if (res.status === 'complete') {
          await setActiveSignUp({ session: res.createdSessionId });
        } else {
          throw new Error('Sign-up not complete');
        }
      }
    } catch (err: any) {
      notify('Invalid Code', err?.errors?.[0]?.message || 'That code did not work. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="mail" size={24} color="#D4AF37" />
        <Text style={styles.title}>Sign In</Text>
      </View>

      {stage === 'email' ? (
        <>
          <Text style={styles.description}>
            We'll email you a one-time code — no password needed.
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
          <Pressable style={styles.button} onPress={sendCode} disabled={busy}>
            {busy ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Send Code</Text>}
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.description}>Enter the 6-digit code we emailed to {email}.</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor="#666666"
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
            keyboardType="number-pad"
          />
          <Pressable style={styles.button} onPress={verifyCode} disabled={busy}>
            {busy ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
          </Pressable>
          <Pressable onPress={() => { setStage('email'); setCode(''); }} disabled={busy}>
            <Text style={styles.linkText}>Use a different email</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

export function SignInPanel() {
  const { configured } = useAuth();

  if (!configured) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="construct" size={24} color="#D4AF37" />
          <Text style={styles.title}>Sign-In Coming Soon</Text>
        </View>
        <Text style={styles.description}>
          Accounts and checkout aren't live yet. Check back shortly.
        </Text>
      </View>
    );
  }

  return <ClerkEmailCodeFlow />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(31, 40, 51, 0.7)', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37' },
  description: { fontSize: 14, color: '#C5C6C7', marginBottom: 16, lineHeight: 20 },
  input: { backgroundColor: '#1F2833', borderRadius: 12, padding: 16, color: '#FFFFFF', marginBottom: 16, borderWidth: 1, borderColor: '#D4AF37' },
  button: { backgroundColor: '#D4AF37', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#D4AF37', fontSize: 13, textAlign: 'center', marginTop: 12 },
});
