// app/(tabs)/course.tsx
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CourseScreen() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [lastCompletedModule, setLastCompletedModule] = useState('');

  const router = useRouter();

  // Simulated entitlement check
  useEffect(() => {
    const checkAccess = async () => {
      // TODO(Phase 2): replace with a real Supabase entitlement lookup
      // keyed on the authenticated user, populated by the Stripe webhook.

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // MOCK ACCESS: In a real app, this value would come from a verified source.
      const mockAuthorized = true; // Set to true for verification
      setHasAccess(mockAuthorized);
      setLoading(false);
    };

    checkAccess();
  }, []);

  const claimCredential = (moduleName: string) => {
    setLastCompletedModule(moduleName);
    setShowCredentialModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Checking course access...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.lockContainer}>
          <Ionicons name="lock-closed" size={80} color="#D4AF37" />
          <Text style={styles.lockTitle}>Access Restricted</Text>
          <Text style={styles.lockSubtitle}>
            Purchase the course to unlock advanced coursework.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/reserve')}
          >
            <Text style={styles.buttonText}>Get Access</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.courseBadge}>Level: ADVANCED</Text>
          <Text style={styles.title}>Prompt Engineering Mastery</Text>
          <Text style={styles.subtitle}>2026 Professional Curriculum</Text>
        </View>

        <View style={styles.courseCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="documents" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Module 1: Semantic Anchoring</Text>
          </View>
          <Text style={styles.cardText}>
            Learn how to use high-density semantic anchors to pin LLM reasoning across complex contexts.
          </Text>
          <Pressable style={styles.completeButton} onPress={() => claimCredential('Semantic Anchoring')}>
            <Text style={styles.completeButtonText}>Complete & Issue Credential</Text>
          </Pressable>
        </View>

        <View style={styles.courseCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="git-network" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Module 2: Agentic Loop Design</Text>
          </View>
          <Text style={styles.cardText}>
            Building recursive feedback loops for autonomous problem solving and error correction.
          </Text>
          <View style={styles.gasBadge}>
            <Ionicons name="flash" size={14} color="#00A896" />
            <Text style={styles.gasText}>Uses AI Tutor credits per query</Text>
          </View>
        </View>

        <View style={styles.courseCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Module 3: Responsible AI Use</Text>
          </View>
          <Text style={styles.cardText}>
            Best practices for using AI tools safely, ethically, and effectively.
          </Text>
        </View>

      </View>

      {/* Credential Modal */}
      <Modal
        visible={showCredentialModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.credentialCard}>
            <Ionicons name="ribbon" size={60} color="#D4AF37" />
            <Text style={styles.modalTitle}>Module Complete</Text>
            <Text style={styles.modalSubtitle}>Completion Certificate</Text>

            <View style={styles.divider} />

            <Text style={styles.certLabel}>Competency:</Text>
            <Text style={styles.certValue}>{lastCompletedModule}</Text>

            <Text style={styles.certFooter}>Issued by Apollo Technologies US (2026)</Text>

            <Pressable style={styles.button} onPress={() => setShowCredentialModal(false)}>
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C10' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { padding: 20 },
  header: { marginBottom: 32, marginTop: 16 },
  courseBadge: { color: '#00A896', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37' },
  subtitle: { fontSize: 16, color: '#C5C6C7', marginTop: 4 },
  loadingText: { color: '#C5C6C7', fontSize: 16, marginTop: 16 },
  
  lockContainer: { alignItems: 'center', backgroundColor: 'rgba(31, 40, 51, 0.7)', padding: 32, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  lockTitle: { fontSize: 24, fontWeight: 'bold', color: '#D4AF37', marginTop: 24, marginBottom: 12 },
  lockSubtitle: { fontSize: 16, color: '#C5C6C7', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  
  button: { backgroundColor: '#D4AF37', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 12 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  
  courseCard: { backgroundColor: 'rgba(31, 40, 51, 0.7)', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(197, 198, 199, 0.1)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37' },
  cardText: { fontSize: 14, color: '#C5C6C7', lineHeight: 20, marginBottom: 16 },
  
  completeButton: { backgroundColor: '#1F2833', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center' },
  completeButtonText: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
  
  gasBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 168, 150, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 12, gap: 4 },
  gasText: { color: '#00A896', fontSize: 11, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  credentialCard: { backgroundColor: '#0B0C10', borderRadius: 24, padding: 32, width: '100%', maxWidth: 450, alignItems: 'center', borderWidth: 2, borderColor: '#D4AF37' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#D4AF37', marginTop: 16, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#00A896', fontWeight: 'bold', marginBottom: 24 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(212, 175, 55, 0.2)', marginBottom: 24 },
  certLabel: { color: '#C5C6C7', fontSize: 12, marginBottom: 4 },
  certValue: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  certFooter: { color: '#C5C6C7', fontSize: 10, fontStyle: 'italic', marginBottom: 32, opacity: 0.6 },
});
