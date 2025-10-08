// src/screens/BookingConfirmationScreen.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookingConfirmationScreen({ route, navigation }: any) {
  const { booking } = route.params;

  const handleViewBookings = () => {
    navigation.navigate('Bookings');
  };

  const handleExploreMore = () => {
    navigation.navigate('GuestHome');
  };

  const handleShareBooking = () => {
    Alert.alert('Share', 'Booking details copied to clipboard!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={60} color="#28a745" />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successMessage}>
          <Text style={styles.successTitle}>Booking Confirmed! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your {booking.trip.title} adventure is all set!
          </Text>
        </View>

        {/* Booking Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>{booking.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trip:</Text>
            <Text style={styles.detailValue}>{booking.trip.title}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Agency:</Text>
            <Text style={styles.detailValue}>{booking.trip.agency}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Travelers:</Text>
            <Text style={styles.detailValue}>
              {booking.travelers.length} person(s)
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>
              {booking.totalPrice.toLocaleString()} DA
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.cardTitle}>What's Next?</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Text>📧</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Confirmation Email</Text>
              <Text style={styles.stepDescription}>
                You'll receive a confirmation email with all details
              </Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Text>📞</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Agency Contact</Text>
              <Text style={styles.stepDescription}>
                The agency will contact you within 24 hours
              </Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Text>📱</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Stay Updated</Text>
              <Text style={styles.stepDescription}>
                Check your bookings section for updates
              </Text>
            </View>
          </View>
        </View>

        {/* Agency Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.cardTitle}>Agency Contact</Text>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color="#0066cc" />
            <Text style={styles.contactText}>+213 XXX XXX XXX</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color="#0066cc" />
            <Text style={styles.contactText}>contact@agency.dz</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={16} color="#0066cc" />
            <Text style={styles.contactText}>Algiers, Algeria</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleShareBooking}
        >
          <Ionicons name="share-outline" size={20} color="#0066cc" />
          <Text style={styles.secondaryButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleViewBookings}
        >
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  animationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d4edda',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#28a745',
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statusBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724',
  },
  nextStepsCard: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1f0ff',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e1f0ff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066cc',
    marginRight: 10,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0066cc',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});