// src/screens/TravelPreferencesScreen.tsx
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import { useAppStore } from '../store/AppStore';

export default function TravelPreferencesScreen({ navigation }: any) {
  const { user, updateUserProfile } = useAppStore();
  const db = getFirestore();
  
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    budgetRange: 'medium' as 'low' | 'medium' | 'high',
    travelStyle: 'cultural' as 'cultural' | 'adventure' | 'relaxation' | 'family' | 'romantic',
    favoriteCategories: [] as string[],
  });

  const budgetOptions = [
    { key: 'low' as const, label: 'Budget', icon: 'wallet-outline', description: 'Save and explore' },
    { key: 'medium' as const, label: 'Comfort', icon: 'business-outline', description: 'Comfort & value' },
    { key: 'high' as const, label: 'Luxury', icon: 'diamond-outline', description: 'Top-tier experience' },
  ];

  const styleOptions = [
    { key: 'adventure' as const, label: 'Adventure', icon: 'trail-sign-outline' },
    { key: 'cultural' as const, label: 'Cultural', icon: 'library-outline' },
    { key: 'relaxation' as const, label: 'Relaxation', icon: 'umbrella-outline' },
    { key: 'family' as const, label: 'Family', icon: 'people-outline' },
    { key: 'romantic' as const, label: 'Romantic', icon: 'heart-outline' },
  ];

  const interestOptions = [
    'Beaches', 'Mountains', 'History', 'Food', 'Nightlife', 
    'Shopping', 'Photography', 'Nature', 'Desert', 'Cities',
    'Festivals', 'Museums', 'Sports', 'Wellness', 'Wildlife'
  ];

  // Load current preferences
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        budgetRange: user.preferences.budgetRange || 'medium',
        travelStyle: user.preferences.travelStyle || 'cultural',
        favoriteCategories: user.preferences.favoriteCategories || [],
      });
    }
  }, [user]);

  const handleBudgetSelect = (budget: 'low' | 'medium' | 'high') => {
    setPreferences(prev => ({ ...prev, budgetRange: budget }));
  };

  const handleStyleSelect = (style: 'cultural' | 'adventure' | 'relaxation' | 'family' | 'romantic') => {
    setPreferences(prev => ({ ...prev, travelStyle: style }));
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => {
      const exists = prev.favoriteCategories.includes(interest);
      if (exists) {
        return {
          ...prev,
          favoriteCategories: prev.favoriteCategories.filter(i => i !== interest)
        };
      } else {
        if (prev.favoriteCategories.length >= 8) {
          Alert.alert('Limit Reached', 'You can select up to 8 interests. Remove some to add new ones.');
          return prev;
        }
        return {
          ...prev,
          favoriteCategories: [...prev.favoriteCategories, interest]
        };
      }
    });
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const updatedPreferences = {
        budgetRange: preferences.budgetRange,
        travelStyle: preferences.travelStyle,
        favoriteCategories: preferences.favoriteCategories,
        lastUpdated: new Date().toISOString(),
      };

      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: updatedPreferences,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      await updateUserProfile({ preferences: updatedPreferences });

      Alert.alert('Success', 'Travel preferences updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Travel Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Range</Text>
          <Text style={styles.sectionSubtitle}>Choose what fits your comfort zone</Text>
          
          <View style={styles.optionsGrid}>
            {budgetOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.budgetCard,
                  preferences.budgetRange === option.key && styles.budgetCardSelected
                ]}
                onPress={() => handleBudgetSelect(option.key)}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={32} 
                  color={preferences.budgetRange === option.key ? '#0ea5e9' : '#666'} 
                />
                <Text style={styles.budgetLabel}>{option.label}</Text>
                <Text style={styles.budgetDescription}>{option.description}</Text>
                {preferences.budgetRange === option.key && (
                  <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Travel Style Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Style</Text>
          <Text style={styles.sectionSubtitle}>Pick your preferred travel vibe</Text>
          
          <View style={styles.styleGrid}>
            {styleOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.styleOption,
                  preferences.travelStyle === option.key && styles.styleOptionSelected
                ]}
                onPress={() => handleStyleSelect(option.key)}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={preferences.travelStyle === option.key ? '#0ea5e9' : '#666'} 
                />
                <Text style={[
                  styles.styleLabel,
                  preferences.travelStyle === option.key && styles.styleLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.sectionSubtitle}>
            Choose up to 8 interests ({preferences.favoriteCategories.length}/8 selected)
          </Text>
          
          <View style={styles.interestsGrid}>
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  preferences.favoriteCategories.includes(interest) && styles.interestChipSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestText,
                  preferences.favoriteCategories.includes(interest) && styles.interestTextSelected
                ]}>
                  {interest}
                </Text>
                {preferences.favoriteCategories.includes(interest) && (
                  <Ionicons name="checkmark" size={14} color="#fff" style={styles.interestCheckmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
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
  headerSpacer: {
    width: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'column',
  },
  budgetCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    position: 'relative',
  },
  budgetCardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  budgetLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  budgetDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleOption: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleOptionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  styleLabelSelected: {
    color: '#0ea5e9',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interestChipSelected: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  interestTextSelected: {
    color: '#fff',
  },
  interestCheckmark: {
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#0ea5e9',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});