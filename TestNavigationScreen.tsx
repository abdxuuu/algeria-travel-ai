// src/screens/TestNavigationScreen.tsx (UPDATED - added Onboarding1 test card)
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function TestNavigationScreen({ navigation }: any) {
  const testTrip = {
    id: 'test-1',
    title: 'Sahara Desert Adventure',
    price: '89,000 DA',
    duration: '7 days • All inclusive camp',
    location: 'Djanet, Algeria',
    agency: 'Sahara Travels',
    rating: 4.8,
    category: 'Desert',
    images: [require('../assets/image1.jpg')]
  };

  const testScreens = [
    { title: '🚀 Guest Home Screen', description: 'Continue as guest - Limited features', screen: 'GuestHome', color: '#0066cc' },
    { title: '👤 User Home Screen', description: 'Logged-in user dashboard - Full features', screen: 'UserHome', color: '#28a745' },
    { title: '📝 Signup Screen', description: 'Create new account', screen: 'Signup', color: '#e83e8c' },
    { title: '🔐 Login Screen', description: 'User authentication', screen: 'Login', color: '#20c997' },
    { title: '🏠 Onboarding (new)', description: 'Run OnboardingScreen1 (profile setup)', screen: 'Onboarding1', color: '#6c757d' },
    { title: '🏠 Onboarding (legacy)', description: 'Old onboarding route', screen: 'Onboarding', color: '#6c757d' },
    { title: '💰 Booking Process', description: 'Complete booking flow (3 steps)', screen: 'Booking', color: '#17a2b8', params: { trip: testTrip } },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 App Testing Hub</Text>
          <Text style={styles.subtitle}>Test all screens easily! Tap any card to navigate.</Text>
        </View>

        {testScreens.map((screen, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testCard, { borderLeftColor: screen.color }]}
            onPress={() => navigation.navigate(screen.screen, screen.params || {})}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{screen.title}</Text>
              <View style={[styles.colorDot, { backgroundColor: screen.color }]} />
            </View>
            <Text style={styles.cardDescription}>{screen.description}</Text>
            <View style={styles.navigationHint}><Text style={styles.navigationText}>Tap to open →</Text></View>
          </TouchableOpacity>
        ))}

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Testing Instructions</Text>
          <View style={styles.instructionItem}><Text style={styles.instructionNumber}>1</Text><Text style={styles.instructionText}>For Booking Screen: Use the "Booking Process" card below</Text></View>
          <View style={styles.instructionItem}><Text style={styles.instructionNumber}>2</Text><Text style={styles.instructionText}>For real booking: Go to Guest Home → Trip → Book Now</Text></View>
          <View style={styles.instructionItem}><Text style={styles.instructionNumber}>3</Text><Text style={styles.instructionText}>Use device back button to return here</Text></View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.actionsTitle}>Quick Navigation</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('GuestHome')}><Text style={styles.actionButtonText}>Guest Flow</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AIAssistant')}><Text style={styles.actionButtonText}>AI Assistant</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Booking', { trip: testTrip })}><Text style={styles.actionButtonText}>Test Booking</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
  testCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, marginBottom: 15, borderLeftWidth: 4, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  cardDescription: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  navigationHint: { alignSelf: 'flex-end' },
  navigationText: { fontSize: 12, color: '#0066cc', fontWeight: '600' },
  instructionsCard: { backgroundColor: '#f8f9fa', padding: 20, borderRadius: 12, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#e9ecef' },
  instructionsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },
  instructionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  instructionNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0066cc', color: '#ffffff', textAlign: 'center', lineHeight: 20, fontWeight: 'bold', marginRight: 12, fontSize: 12 },
  instructionText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  quickActions: { marginTop: 10, marginBottom: 25 },
  actionsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15, textAlign: 'center' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flex: 1, backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  actionButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});
