// src/screens/PaymentMethodsScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal' | 'applepay';
  lastFour?: string;
  name: string;
  expiry?: string;
  isDefault: boolean;
};

export default function PaymentMethodsScreen({ navigation }: any) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      lastFour: '4242',
      name: 'Visa ending in 4242',
      expiry: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'paypal',
      name: 'PayPal Account',
      isDefault: false,
    },
  ]);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleDeleteMethod = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(m => m.id !== id));
            Alert.alert('Success', 'Payment method removed');
          },
        },
      ]
    );
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'applepay':
        return 'logo-apple';
      default:
        return 'card-outline';
    }
  };

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'card':
        return '#0ea5e9';
      case 'paypal':
        return '#0070ba';
      case 'applepay':
        return '#000000';
      default:
        return '#666666';
    }
  };

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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <View style={[styles.paymentIcon, { backgroundColor: getPaymentColor(method.type) }]}>
                  <Ionicons name={getPaymentIcon(method.type) as any} size={20} color="#fff" />
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  {method.lastFour && (
                    <Text style={styles.paymentMeta}>Expires {method.expiry}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.paymentActions}>
                {method.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMethod(method.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Payment Method</Text>
          
          <TouchableOpacity style={styles.addMethodCard}>
            <View style={styles.addMethodInfo}>
              <View style={[styles.paymentIcon, { backgroundColor: '#0ea5e9' }]}>
                <Ionicons name="card-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.addMethodText}>Credit or Debit Card</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addMethodCard}>
            <View style={styles.addMethodInfo}>
              <View style={[styles.paymentIcon, { backgroundColor: '#0070ba' }]}>
                <Ionicons name="logo-paypal" size={20} color="#fff" />
              </View>
              <Text style={styles.addMethodText}>PayPal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addMethodCard}>
            <View style={styles.addMethodInfo}>
              <View style={[styles.paymentIcon, { backgroundColor: '#000000' }]}>
                <Ionicons name="logo-apple" size={20} color="#fff" />
              </View>
              <Text style={styles.addMethodText}>Apple Pay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={styles.securityTitle}>Secure & Encrypted</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment information is securely stored and encrypted. We never share your details with third parties.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentMeta: {
    fontSize: 14,
    color: '#666',
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  defaultBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  setDefaultButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    marginRight: 12,
  },
  setDefaultText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  addMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  securitySection: {
    backgroundColor: '#f0f9ff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});