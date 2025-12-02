// app/(tabs)/profile.tsx
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Alert, Image } from 'react-native';
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
          <Text style={styles.subtitle}>ETHEREUM TOKEN</Text>
          <Text style={styles.tagline}>A meme token built on the Ethereum blockchain.</Text>
          <Text style={styles.disclaimer}>Not an investment. Not financial advice.</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Apollo 18</Text>
          <Text style={styles.sectionSubtitle}>$APOLO - A Meme Token Like No Other</Text>
          <Text style={styles.paragraph}>
            Welcome to $APOLO – a digital meme token built on the Ethereum blockchain. 
            This is not an investment. This is not financial advice. $APOLO has no intrinsic 
            value and makes no promises of future development.
          </Text>
          <Text style={styles.paragraph}>
            $APOLO was created to celebrate the unpredictable, community-driven nature of 
            cryptocurrency. Like other meme tokens before it, $APOLO exists purely as a 
            cultural experiment in digital asset creation.
          </Text>
          <Text style={styles.paragraph}>
            All potential developments surrounding $APOLO will be determined by its community, 
            not by any centralized team. Any future integrations, utilities, or applications 
            would be independent community efforts, not official developments.
          </Text>
        </View>

        {/* Token Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={24} color="#FFD700" />
              <Text style={styles.featureTitle}>ERC20 Protocol</Text>
              <Text style={styles.featureDescription}>Built on established, reliable, and secure Ethereum blockchain</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="lock-closed" size={24} color="#FFD700" />
              <Text style={styles.featureTitle}>Secure</Text>
              <Text style={styles.featureDescription}>Built on Ethereum blockchain</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={24} color="#FFD700" />
              <Text style={styles.featureTitle}>Community</Text>
              <Text style={styles.featureDescription}>Transparent community experiment</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="rocket" size={24} color="#FFD700" />
              <Text style={styles.featureTitle}>Meme Token</Text>
              <Text style={styles.featureDescription}>Cultural experiment</Text>
            </View>
          </View>
        </View>

        {/* Token Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoText}>Community Building Phase</Text>
            
            <Text style={styles.infoLabel}>Contract Address</Text>
            <Text style={styles.contractAddress}>
              0x0e3541725230432653A9a3F65eB5591D16822de0
            </Text>
            
            <Text style={styles.infoLabel}>Exchange Listings</Text>
            <Text style={styles.infoText}>Future listings will be pursued based on community interest and organic growth.</Text>
            
            <Text style={styles.infoLabel}>Souvenir Coin</Text>
            <Text style={styles.infoText}>A commemorative physical coin may be offered in the future, subject to community demand.</Text>
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Community</Text>
          <Text style={styles.paragraph}>
            Join our community and help shape Apollo 18! Active participants are the core of this experiment.
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="person" size={24} color="#FFD700" />
              <Text style={styles.statLabel}>Transparent Creation</Text>
              <Text style={styles.statDescription}>Initiated and stewarded by a solo founder</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubbles" size={24} color="#FFD700" />
              <Text style={styles.statLabel}>Community-Led Future</Text>
              <Text style={styles.statDescription}>All major directions will be proposed and voted on by holders</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="git-network" size={24} color="#FFD700" />
              <Text style={styles.statLabel}>Evolving Governance</Text>
              <Text style={styles.statDescription}>Goal is to transition meaningful control to the community as it grows</Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            Our Apollo 18 APOLO community is what makes this token unique. Join us and be part of building something from the ground up!
          </Text>
        </View>

        {/* Legal Notice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Disclaimer</Text>
          <View style={styles.legalCard}>
            <Ionicons name="warning" size={20} color="#FF4444" />
            <Text style={styles.legalTitle}>⚠️ Important Disclaimer</Text>
            <Text style={styles.legalText}>
              $APOLO is a meme token created for cultural and entertainment purposes on the Ethereum blockchain. 
              It is <Text style={styles.highlight}>not an investment</Text>, a security, or a financial product. 
              It has <Text style={styles.highlight}>no intrinsic value</Text>, no promised utility, and no expectation of profit.
            </Text>
            <Text style={styles.legalSubtitle}>By interacting with $APOLO or this website, you acknowledge and agree to the following:</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>High Risk:</Text> Cryptocurrencies are highly volatile. You should only use funds you are prepared to lose entirely.</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>No Financial Advice:</Text> Nothing here constitutes financial advice. You are solely responsible for your decisions.</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>Transparent Structure:</Text> The project was created by a solo founder. A transparent creator allocation exists to support ongoing development and marketing efforts.</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>Your Responsibility:</Text> You are solely liable for any tax implications and for ensuring your interaction complies with laws in your jurisdiction.</Text>
            <Text style={styles.legalBullet}>• <Text style={styles.bold}>No Guarantees:</Text> There are no guarantees of future development, exchange listings, or value retention.</Text>
            <Text style={styles.legalText}>
              This project is an experimental community effort. Participate wisely.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Pressable style={styles.contactButton} onPress={contactEmail}>
            <Ionicons name="mail" size={16} color="#FFD700" />
            <Text style={styles.contactText}>Info@apollo18token.com</Text>
          </Pressable>
          <Pressable style={styles.contactButton} onPress={contactPhone}>
            <Ionicons name="call" size={16} color="#FFD700" />
            <Text style={styles.contactText}>+1 469-550-9909</Text>
          </Pressable>
          <Pressable style={styles.contactButton} onPress={() => openLink('https://apollo18token.com')}>
            <Ionicons name="globe" size={16} color="#FFD700" />
            <Text style={styles.contactText}>apollo18token.com</Text>
          </Pressable>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Apollo18token.com. All rights reserved.</Text>
          </View>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', marginBottom: 4, opacity: 0.8 },
  disclaimer: { fontSize: 12, color: '#FF4444', textAlign: 'center', fontStyle: 'italic' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFD700', marginBottom: 16 },
  sectionSubtitle: { fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginBottom: 12 },
  paragraph: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 12, opacity: 0.8 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  featureItem: { width: '48%', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, alignItems: 'center' },
  featureTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8, marginBottom: 4, textAlign: 'center' },
  featureDescription: { fontSize: 12, color: '#FFFFFF', textAlign: 'center', opacity: 0.8, lineHeight: 16 },
  infoCard: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 12 },
  infoLabel: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  infoText: { fontSize: 14, color: '#FFFFFF', marginBottom: 16, opacity: 0.8 },
  contractAddress: { fontSize: 12, color: '#FFFFFF', fontFamily: 'monospace', marginBottom: 16, backgroundColor: '#2A2A2A', padding: 8, borderRadius: 6 },
  stats: { marginVertical: 16 },
  stat: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  statLabel: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginTop: 8, marginBottom: 4, textAlign: 'center' },
  statDescription: { fontSize: 12, color: '#FFFFFF', textAlign: 'center', opacity: 0.8, lineHeight: 16 },
  legalCard: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FF4444' },
  legalTitle: { fontSize: 16, fontWeight: 'bold', color: '#FF4444', marginBottom: 8 },
  legalText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 12, opacity: 0.8 },
  legalSubtitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  legalBullet: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 8, opacity: 0.8, marginLeft: 8 },
  contactButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, padding: 12, backgroundColor: '#1A1A1A', borderRadius: 8 },
  contactText: { color: '#FFD700', fontSize: 14 },
  footer: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#333333' },
  footerText: { fontSize: 12, color: '#666666', textAlign: 'center', marginBottom: 4 },
  highlight: { color: '#FF4444', fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
});