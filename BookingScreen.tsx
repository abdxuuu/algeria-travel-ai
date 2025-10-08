// src/screens/BookingScreen.tsx (FIXED)
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Traveler = {
  id: string;
  fullName: string;
  age: number;
  passportNumber?: string;
};

export default function BookingScreen({ route, navigation }: any) {
  // FIX: Add safe trip handling
  const { trip } = route.params || {};
  
  // FIX: Check if trip exists
  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip information not available</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const [bookingData, setBookingData] = useState({
    travelDates: {
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    },
    travelers: [{ id: '1', fullName: '', age: 30 }] as Traveler[],
    paymentMethod: 'cash' as 'cash' | 'card' | 'mobile_money',
    specialRequests: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate pricing
  const calculateTotal = () => {
    const basePrice = parseInt(trip.price?.replace(/\D/g, '')) || 89000;
    const travelerCount = bookingData.travelers.length;
    return basePrice * travelerCount;
  };

  const handleAddTraveler = () => {
    if (bookingData.travelers.length >= 6) {
      Alert.alert('Maximum reached', 'You can book for up to 6 travelers');
      return;
    }
    
    setBookingData(prev => ({
      ...prev,
      travelers: [
        ...prev.travelers,
        { id: Date.now().toString(), fullName: '', age: 30 }
      ]
    }));
  };

  const handleRemoveTraveler = (id: string) => {
    if (bookingData.travelers.length <= 1) {
      Alert.alert('Minimum travelers', 'At least one traveler is required');
      return;
    }
    
    setBookingData(prev => ({
      ...prev,
      travelers: prev.travelers.filter(t => t.id !== id)
    }));
  };

  const handleTravelerChange = (id: string, field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      travelers: prev.travelers.map(traveler =>
        traveler.id === id ? { ...traveler, [field]: value } : traveler
      )
    }));
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('BookingConfirmation', {
        booking: {
          id: 'BK' + Date.now(),
          trip,
          ...bookingData,
          // FIX: Convert dates to strings for serialization
          travelDates: {
            start: bookingData.travelDates.start.toISOString(),
            end: bookingData.travelDates.end.toISOString(),
          },
          totalPrice: calculateTotal(),
          bookingDate: new Date().toISOString(), // Convert to string
          status: 'confirmed',
          paymentStatus: 'paid',
        }
      });
    }, 2000);
  };

  const totalPrice = calculateTotal();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Booking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map(step => (
          <View key={step} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              step === currentStep && styles.stepCircleActive,
              step < currentStep && styles.stepCircleCompleted
            ]}>
              {step < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              ) : (
                <Text style={[
                  styles.stepText,
                  step === currentStep && styles.stepTextActive
                ]}>
                  {step}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              step === currentStep && styles.stepLabelActive
            ]}>
              {step === 1 ? 'Details' : step === 2 ? 'Payment' : 'Confirm'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Trip Summary */}
        <View style={styles.tripSummary}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>
          <View style={styles.tripCard}>
            <Text style={styles.tripName}>{trip.title}</Text>
            <Text style={styles.tripAgency}>By {trip.agency}</Text>
            <Text style={styles.tripDuration}>{trip.duration}</Text>
            <Text style={styles.tripLocation}>📍 {trip.location}</Text>
          </View>
        </View>

        {/* Step 1: Traveler Details */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Traveler Information</Text>
            
            {bookingData.travelers.map((traveler, index) => (
              <View key={traveler.id} style={styles.travelerCard}>
                <View style={styles.travelerHeader}>
                  <Text style={styles.travelerTitle}>
                    Traveler {index + 1} {index === 0 && '(Primary)'}
                  </Text>
                  {index > 0 && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveTraveler(traveler.id)}
                    >
                      <Ionicons name="close" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={traveler.fullName}
                  onChangeText={(value) => handleTravelerChange(traveler.id, 'fullName', value)}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  keyboardType="numeric"
                  value={traveler.age.toString()}
                  onChangeText={(value) => handleTravelerChange(traveler.id, 'age', value)}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Passport Number (Optional)"
                  value={traveler.passportNumber}
                  onChangeText={(value) => handleTravelerChange(traveler.id, 'passportNumber', value)}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addTravelerButton} onPress={handleAddTraveler}>
              <Ionicons name="person-add" size={20} color="#0066cc" />
              <Text style={styles.addTravelerText}>Add Another Traveler</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Special requests or notes..."
              multiline
              numberOfLines={3}
              value={bookingData.specialRequests}
              onChangeText={(value) => setBookingData(prev => ({ ...prev, specialRequests: value }))}
            />
          </View>
        )}

        {/* Step 2: Payment Method */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            {[
              { id: 'cash', label: '💵 Cash Payment', desc: 'Pay at agency office' },
              { id: 'card', label: '💳 Credit/Debit Card', desc: 'Secure online payment' },
              { id: 'mobile_money', label: '📱 Mobile Money', desc: 'Djezzy, Mobilis, Ooredoo' }
            ].map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  bookingData.paymentMethod === method.id && styles.paymentMethodSelected
                ]}
                onPress={() => setBookingData(prev => ({ ...prev, paymentMethod: method.id as any }))}
              >
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodLabel}>{method.label}</Text>
                  <Text style={styles.paymentMethodDesc}>{method.desc}</Text>
                </View>
                <View style={[
                  styles.radioCircle,
                  bookingData.paymentMethod === method.id && styles.radioCircleSelected
                ]}>
                  {bookingData.paymentMethod === method.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trip:</Text>
                <Text style={styles.summaryValue}>{trip.title}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Travelers:</Text>
                <Text style={styles.summaryValue}>{bookingData.travelers.length} person(s)</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Base Price:</Text>
                <Text style={styles.summaryValue}>{trip.price}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.totalPrice}>{totalPrice.toLocaleString()} DA</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method:</Text>
                <Text style={styles.summaryValue}>
                  {bookingData.paymentMethod === 'cash' ? 'Cash' : 
                   bookingData.paymentMethod === 'card' ? 'Credit Card' : 'Mobile Money'}
                </Text>
              </View>
            </View>

            <View style={styles.agencyContact}>
              <Text style={styles.contactTitle}>Agency Contact</Text>
              <Text style={styles.contactInfo}>📞 +213 XXX XXX XXX</Text>
              <Text style={styles.contactInfo}>📧 contact@agency.dz</Text>
            </View>
          </View>
        )}

        {/* Price Summary - FIXED: Added padding for better scrolling */}
        <View style={styles.priceSummary}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total Amount:</Text>
            <Text style={styles.priceValue}>{totalPrice.toLocaleString()} DA</Text>
          </View>
          <Text style={styles.priceNote}>Taxes and fees included</Text>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backButtonFooter}
            onPress={() => setCurrentStep(prev => prev - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            isLoading && styles.nextButtonDisabled
          ]}
          onPress={() => {
            if (currentStep < 3) {
              setCurrentStep(prev => prev + 1);
            } else {
              handleConfirmBooking();
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.nextButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Confirm Booking' : 'Continue'}
            </Text>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // 👈 ADD THIS LINE - moves header down
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 0, // 👈 ADD THIS LINE - moves header down
    color: '#1a1a1a',
  },
  placeholder: {
    width: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepCircleActive: {
    backgroundColor: '#0066cc',
  },
  stepCircleCompleted: {
    backgroundColor: '#28a745',
  },
  stepText: {
    color: '#666',
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
  },
  stepLabelActive: {
    color: '#0066cc',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20, // Added padding for better scrolling
  },
  tripSummary: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  tripCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tripAgency: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tripDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tripLocation: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  stepContent: {
    marginBottom: 25,
  },
  travelerCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  travelerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40, // 👈 ADD THIS LINE - moves header down
    alignItems: 'center',
    marginBottom: 12,
  },
  travelerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  removeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addTravelerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1f0ff',
    marginBottom: 15,
  },
  addTravelerText: {
    color: '#0066cc',
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentMethodSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#0066cc',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentMethodDesc: {
    fontSize: 14,
    color: '#666',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#0066cc',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066cc',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  agencyContact: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    marginTop: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  priceSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 10, // Added margin for better spacing
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  priceNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  backButtonFooter: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginRight: 10,
  },
  backButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});