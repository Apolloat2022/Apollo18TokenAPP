import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1A1A1A', // Lighter black for cards
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#FFFFFF', // White text
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.9,
  },
  goldText: {
    fontSize: 14,
    color: '#FFD700', // Gold text for specific elements
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.9,
  },
  highlight: {
    color: '#FFD700', // Gold highlights
    fontWeight: 'bold',
  },
  whiteHighlight: {
    color: '#FFFFFF', // White highlights
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#2A2A2A', // Lighter background
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF', // White text
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  contactInfo: {
    backgroundColor: '#2A2A2A', // Lighter background
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 4,
  },
  legalNotice: {
    backgroundColor: '#2a2a2a', // Lighter background
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    marginTop: 8,
  },
  legalText: {
    fontSize: 12,
    color: '#FFFFFF', // White text
    lineHeight: 16,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFD700',
  },
  footerText: {
    fontSize: 12,
    color: '#B8860B',
    textAlign: 'center',
  },
});

export default function ProfileScreen() {
  const openEmail = () => {
    Linking.openURL('mailto:Info@apollo18token.com');
  };

  const openPhone = () => {
    Linking.openURL('tel:+14695509909');
  };

  const openWebsite = () => {
    Linking.openURL('https://apollo18token.com');
  };

  const features = [
    { icon: '⚡', title: 'ERC20 Protocol', description: 'Ethereum ecosystem compatible' },
    { icon: '🔒', title: 'Secure', description: 'Built on Ethereum blockchain' },
    { icon: '👥', title: 'Community', description: '100% decentralized' },
    { icon: '🎯', title: 'Meme Token', description: 'Cultural experiment' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>APOLLO 18</Text>
          <Text style={styles.subtitle}>ETHEREUM TOKEN</Text>
          <Text style={[styles.cardText, {textAlign: 'center'}]}>
            A meme token built on the Ethereum blockchain.{'\n'}
            Not an investment. Not financial advice.
          </Text>
        </View>

        {/* About Apollo 18 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Apollo 18</Text>
          <Text style={styles.sectionTitle}>$APOLO - A Meme Token Like No Other</Text>
          
          <Text style={styles.cardText}>
            <Text style={styles.highlight}>The $APOLO Reality</Text>
            {'\n\n'}
            Welcome to $APOLO – a digital meme token built on the Ethereum blockchain. 
            This is not an investment. This is not financial advice. $APOLO has no intrinsic 
            value and makes no promises of future development.
            {'\n\n'}
            $APOLO was created to celebrate the unpredictable, community-driven nature of 
            cryptocurrency. Like other meme tokens before it, $APOLO exists purely as a 
            cultural experiment in digital asset creation.
            {'\n\n'}
            All potential developments surrounding $APOLO will be determined by its community, 
            not by any centralized team. Any future integrations, utilities, or applications 
            would be independent community efforts, not official developments.
          </Text>
        </View>

        {/* Token Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Token Features</Text>
          <Text style={styles.cardText}>
            Built on established, reliable, and secure Ethereum blockchain
          </Text>
          
          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Text style={{ fontSize: 16, color: '#000000' }}>{feature.icon}</Text>
                </View>
                <Text style={[styles.featureText, {color: '#FFD700'}]}>{feature.title}</Text>
                <Text style={[styles.featureText, {fontSize: 10, opacity: 0.7}]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Token Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Token Information</Text>
          
          <Text style={styles.sectionTitle}>Phase 11</Text>
          <Text style={styles.cardText}>
            Phase 11 is currently active
            {'\n'}
            Send ETH to order Apollo 18 tokens at:
          </Text>
          
          <View style={styles.contactInfo}>
            <Text style={[styles.contactText, {fontFamily: 'monospace'}]}>
              0x0e3541725230432653A9a3F65eB5591D16822de0
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Exchange Listings</Text>
          <Text style={styles.cardText}>
            Coming soon to major cryptocurrency exchanges
          </Text>

          <Text style={styles.sectionTitle}>Souvenir Coin</Text>
          <Text style={styles.cardText}>
            Soon you'll be able to order Apollo 18 Token coin online for souvenir
          </Text>
        </View>

        {/* Community */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Community</Text>
          <Text style={styles.cardText}>
            Join our community and help build Apollo 18! Active members get exclusive roles & perks.
          </Text>
          
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Text style={[styles.featureText, styles.highlight]}>100%</Text>
              <Text style={styles.featureText}>Decentralized</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureText, styles.highlight]}>0</Text>
              <Text style={styles.featureText}>Team Control</Text>
            </View>
          </View>
          
          <Text style={styles.cardText}>
            Our Apollo 18 APOLO community is what makes this token special. 
            Join us and be part of the experiment!
          </Text>
        </View>

        {/* Legal Notice */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal Notice</Text>
          <Text style={styles.sectionTitle}>⚠️ Legal Disclaimer</Text>
          
          <View style={styles.legalNotice}>
            <Text style={styles.legalText}>
              APOLO is a meme token with no intrinsic value, not an investment or security. 
              While the initial concept originated from U.S.-based enthusiasts, APOLO now 
              operates as a fully decentralized community project with no controlling entity.
              {'\n\n'}
              By interacting with APOLO you acknowledge:
              {'\n'}
              • No U.S. Access - Not available to U.S. persons per Terms of Service
              {'\n'}
              • No Control - Original developers exercise no ongoing authority
              {'\n'}
              • High Risk - Potential total loss of funds; cryptocurrency is volatile
              {'\n'}
              • No Advice - The community provides no financial guidance
              {'\n'}
              • Personal Liability - You assume all risks and responsibilities
              {'\n\n'}
              This token exists for entertainment purposes only in permitted jurisdictions.
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Us</Text>
          
          <Pressable style={styles.button} onPress={openEmail}>
            <Ionicons name="mail-outline" size={16} color="#000000" />
            <Text style={styles.buttonText}>Info@apollo18token.com</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={openPhone}>
            <Ionicons name="call-outline" size={16} color="#000000" />
            <Text style={styles.buttonText}>+1 469-550-9909</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={openWebsite}>
            <Ionicons name="globe-outline" size={16} color="#000000" />
            <Text style={styles.buttonText}>apollo18token.com</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Apollo18token.com. All rights reserved.{'\n'}
            Apollo Technologies US Inc.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}