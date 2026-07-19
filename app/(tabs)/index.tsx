// app/(tabs)/index.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

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
          <Text style={styles.heroHeadline}>AI usage, tokenized.</Text>
          <Text style={styles.heroSubheadline}>
            Buy credits once, spend them across every Apollo18 course and AI tool.
          </Text>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="school" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Course Catalog</Text>
          </View>
          <Text style={styles.cardDescription}>
            Certified courses in prompt engineering and agentic AI workflows, with more added over time.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.push('/course')}
          >
            <Ionicons name="book" size={20} color="#000000" />
            <Text style={styles.buttonText}>Browse Courses</Text>
          </Pressable>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Apollo18 Credits</Text>
          </View>
          <Text style={styles.cardDescription}>
            One prepaid balance for the AI Tutor, the Prompt Playground, and every course purchase.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.push('/pricing')}
          >
            <Ionicons name="card" size={20} color="#000000" />
            <Text style={styles.buttonText}>Get Credits</Text>
          </Pressable>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Account</Text>
          </View>
          <Text style={styles.cardDescription}>
            Account and access management — coming soon.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={20} color="#D4AF37" />
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { textAlign: 'center', opacity: 0.5 }]}>
            © 2026 Apollo Technologies US. All Rights Reserved.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C10' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 32 },
  logo: { width: 100, height: 100, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', letterSpacing: 4, marginBottom: 12 },
  heroHeadline: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 36, marginBottom: 8, paddingHorizontal: 10 },
  heroSubheadline: { fontSize: 16, color: '#C5C6C7', textAlign: 'center', lineHeight: 22, marginBottom: 8, paddingHorizontal: 10 },

  glassCard: { 
    backgroundColor: 'rgba(31, 40, 51, 0.7)', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)', // Subtle gold border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  cardDescription: { fontSize: 16, color: '#C5C6C7', lineHeight: 24, marginBottom: 20 },
  
  button: { 
    backgroundColor: '#D4AF37', 
    paddingVertical: 18, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  
  secondaryButton: { 
    backgroundColor: 'transparent', 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#D4AF37', 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 8 
  },
  secondaryButtonText: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },

  footer: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 198, 199, 0.1)',
    paddingBottom: 48,
  },
  footerText: {
    color: '#C5C6C7',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'justify',
  },
});