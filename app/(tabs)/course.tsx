// app/(tabs)/course.tsx
import { View, Text, ScrollView, StyleSheet, Pressable, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { catalog, CourseItem } from '../../data/catalog';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboard } from '../../services/api';

const courses = catalog.filter((item): item is CourseItem => item.type === 'course');

export default function CourseScreen() {
  const { isSignedIn, getToken } = useAuth();
  const [ownedSkus, setOwnedSkus] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [lastCompletedModule, setLastCompletedModule] = useState('');

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      setLoading(true);
      if (!isSignedIn) {
        // Signed-out visitors own nothing; every course shows as locked.
        if (!cancelled) {
          setOwnedSkus([]);
          setLoading(false);
        }
        return;
      }
      try {
        const token = await getToken();
        const skus = token ? (await fetchDashboard(token)).entitlements : [];
        if (!cancelled) setOwnedSkus(skus);
      } catch (err) {
        console.error('Failed to load entitlements:', err);
        if (!cancelled) setOwnedSkus([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAccess();
    return () => { cancelled = true; };
  }, [isSignedIn, getToken]);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.courseBadge}>APOLLO18 ACADEMY</Text>
          <Text style={styles.title}>Course Catalog</Text>
          <Text style={styles.subtitle}>One credits balance, every Apollo course</Text>
          {!isSignedIn && (
            <Text style={[styles.subtitle, { color: '#00A896', marginTop: 8 }]}>
              Sign in on the Dashboard tab to unlock courses you've purchased.
            </Text>
          )}
        </View>

        {courses.map((course) => {
          const owned = ownedSkus.includes(course.sku);

          return (
            <View key={course.sku} style={styles.courseSection}>
              <View style={styles.courseHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseBadge}>Level: {course.level}</Text>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.subtitle}>{course.description}</Text>
                </View>
                {course.comingSoon ? (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>COMING SOON</Text>
                  </View>
                ) : !owned ? (
                  <Ionicons name="lock-closed" size={24} color="#D4AF37" />
                ) : null}
              </View>

              {owned &&
                course.modules.map((module) => (
                  <View key={module.title} style={styles.courseCard}>
                    <View style={styles.cardHeader}>
                      <Ionicons name={module.icon} size={24} color="#D4AF37" />
                      <Text style={styles.cardTitle}>{module.title}</Text>
                    </View>
                    <Text style={styles.cardText}>{module.description}</Text>
                    {module.usesCredits ? (
                      <View style={styles.gasBadge}>
                        <Ionicons name="flash" size={14} color="#00A896" />
                        <Text style={styles.gasText}>Uses AI Tutor credits per query</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={styles.completeButton}
                        onPress={() => claimCredential(module.title)}
                      >
                        <Text style={styles.completeButtonText}>Complete & Issue Credential</Text>
                      </Pressable>
                    )}
                  </View>
                ))}

              {!owned && !course.comingSoon && (
                <Pressable style={styles.button} onPress={() => router.push('/reserve')}>
                  <Text style={styles.buttonText}>Get Access — ${course.priceUsd}</Text>
                </Pressable>
              )}
            </View>
          );
        })}
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

  courseSection: { marginBottom: 40 },
  courseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  courseTitle: { fontSize: 22, fontWeight: 'bold', color: '#D4AF37' },
  soonBadge: { backgroundColor: 'rgba(0, 168, 150, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#00A896' },
  soonText: { color: '#00A896', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  button: { backgroundColor: '#D4AF37', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' },
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
