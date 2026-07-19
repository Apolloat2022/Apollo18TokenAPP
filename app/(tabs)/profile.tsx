// app/(tabs)/profile.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Alert, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open link');
    }
  };

  const contactEmail = () => {
    Linking.openURL('mailto:Info@apollo18token.com');
  };

  const contactPhone = () => {
    Linking.openURL('tel:+14695509909');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>APOLLO 18</Text>
          <Text style={styles.subtitle}>DIGITAL TOOL & ACCESS KEY</Text>
          <Text style={styles.tagline}>A functional utility for Advanced AI Coursework & Consulting.</Text>
          <Text style={styles.disclaimer}>SEC/CFTC 2026 Compliant | Non-Security Functional Asset</Text>
        </View>

        {/* About Section */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>About Apollo 18</Text>
          <Text style={styles.sectionSubtitle}>$APOLO - The Key to Advanced Prompt Engineering</Text>
          <Text style={styles.paragraph}>
            Apollo 18 ($APOLO) is an essential digital tool within the Apollo Technologies US ecosystem. 
            It serves as the mandatory "Access Key" for our Advanced Prompt Engineering curriculum 
            and the "Gas" (Fuel) required for proprietary AI agentic queries.
          </Text>
          <Text style={styles.paragraph}>
            Strictly classified as a **Functional Digital Tool** under the March 2026 "Atkins Standard," 
            Apollo 18 is intended for total consumption. It avoids "Managerial Reliance" because its 
            value is programmatically locked to the educational and technical utility it provides.
          </Text>
          <Text style={styles.paragraph}>
            Ownership of this tool signifies participation in the Apollo 18 productivity environment.
            It is not intended for passive investment or speculative purposes.
          </Text>
        </View>

        {/* Token Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tool Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="key" size={24} color="#D4AF37" />
              <Text style={styles.featureTitle}>Access Key</Text>
              <Text style={styles.featureDescription}>Unlocks premium coursework and AI agent tools.</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={24} color="#D4AF37" />
              <Text style={styles.featureTitle}>2026 Compliant</Text>
              <Text style={styles.featureDescription}>Fully aligned with US federal digital property guidelines.</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flame" size={24} color="#D4AF37" />
              <Text style={styles.featureTitle}>API Gas</Text>
              <Text style={styles.featureDescription}>The functional fuel for autonomous AI agent operations.</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={24} color="#D4AF37" />
              <Text style={styles.featureTitle}>Utility-First</Text>
              <Text style={styles.featureDescription}>Primary value derived from technical consumption.</Text>
            </View>
          </View>
        </View>

        {/* Token Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Functional Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Provisioning Status</Text>
            <Text style={styles.infoText}>Functional Deployment Phase - Active</Text>
            
            <Text style={styles.infoLabel}>Digital Identifier (Contract)</Text>
            <Text style={styles.contractAddress}>
              0x0e3541725230432653A9a3F65eB5591D16822de0
            </Text>
            
            <Text style={styles.infoLabel}>Regulatory Jurisdiction</Text>
            <Text style={styles.infoText}>Operating under Texas Government Code Chapter 4004 (Prosper, TX).</Text>
          </View>
        </View>

        {/* Legal Notice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Compliance</Text>
          <View style={styles.legalCard}>
            <Ionicons name="alert-circle" size={20} color="#D4AF37" />
            <Text style={styles.legalTitle}>Regulatory Disclosure</Text>
            <Text style={styles.legalText}>
              Apollo 18 is a **Functional Digital Tool**. It is NOT an investment, a security, 
              or a financial product. It has intrinsic technical utility as an access mechanism.
            </Text>
            <Text style={styles.legalSubtitle}>Notice to Participants:</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>Non-Security Status:</Text> In accordance with SEC/CFTC 2026 guidelines, $APOLO is a consumption-based digital asset.</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>Professional Support:</Text> Educational content does not constitute investment advice per Texas Government Code Chapter 4004.</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>Tax Compliance:</Text> All USD acquisitions are processed via the Texas Tax Engine (Prosper rate: 8.25%).</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>No Speculation:</Text> Participants acknowledge the tool is acquired for its technical utility and access privileges.</Text>
            <Text style={styles.legalText}>
              Apollo Technologies US - Committed to Transparent Digital Innovation.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expert Support</Text>
          <Pressable style={styles.contactButton} onPress={contactEmail}>
            <Ionicons name="mail" size={16} color="#D4AF37" />
            <Text style={styles.contactText}>Info@apollo18token.com</Text>
          </Pressable>
          <Pressable style={styles.contactButton} onPress={contactPhone}>
            <Ionicons name="call" size={16} color="#D4AF37" />
            <Text style={styles.contactText}>+1 469-550-9909</Text>
          </Pressable>
          <Pressable style={styles.contactButton} onPress={() => openLink('https://apollo18token.com')}>
            <Ionicons name="globe" size={16} color="#D4AF37" />
            <Text style={styles.contactText}>apollo18token.com</Text>
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
  subtitle: { fontSize: 14, color: '#C5C6C7', textAlign: 'center', marginBottom: 8, letterSpacing: 2 },
  tagline: { fontSize: 13, color: '#FFFFFF', textAlign: 'center', marginBottom: 8, opacity: 0.9 },
  disclaimer: { fontSize: 11, color: '#00A896', textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  sectionSubtitle: { fontSize: 15, color: '#FFFFFF', fontWeight: '600', marginBottom: 12 },
  paragraph: { fontSize: 14, color: '#C5C6C7', lineHeight: 22, marginBottom: 12 },
  glassCard: { backgroundColor: 'rgba(31, 40, 51, 0.7)', borderRadius: 20, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureItem: { width: '48%', backgroundColor: '#1F2833', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(197, 198, 199, 0.1)' },
  featureTitle: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF', marginTop: 10, marginBottom: 6, textAlign: 'center' },
  featureDescription: { fontSize: 11, color: '#C5C6C7', textAlign: 'center', opacity: 0.8, lineHeight: 15 },
  infoCard: { backgroundColor: '#1F2833', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#D4AF37' },
  infoLabel: { fontSize: 12, fontWeight: 'bold', color: '#D4AF37', marginBottom: 6, textTransform: 'uppercase' },
  infoText: { fontSize: 14, color: '#FFFFFF', marginBottom: 16, opacity: 0.9 },
  contractAddress: { fontSize: 11, color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 16, backgroundColor: '#0B0C10', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  legalCard: { backgroundColor: 'rgba(0, 168, 150, 0.05)', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#00A896', borderWidth: 1, borderColor: 'rgba(0, 168, 150, 0.1)' },
  legalTitle: { fontSize: 16, fontWeight: 'bold', color: '#00A896', marginBottom: 12 },
  legalText: { fontSize: 13, color: '#FFFFFF', lineHeight: 20, marginBottom: 16, opacity: 0.9 },
  legalSubtitle: { fontSize: 13, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10 },
  legalBullet: { fontSize: 12, color: '#C5C6C7', lineHeight: 18, marginBottom: 10, marginLeft: 6 },
  contactButton: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, padding: 16, backgroundColor: '#1F2833', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
  contactText: { color: '#D4AF37', fontSize: 14, fontWeight: '500' },
  footer: { marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1F2833' },
  footerText: { fontSize: 11, color: '#45A29E', textAlign: 'center' },
  bold: { fontWeight: 'bold', color: '#FFFFFF' },
});