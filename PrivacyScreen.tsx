// src/screens/PrivacyScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen({ navigation }: any) {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // 'public' | 'friends' | 'private'
    showEmail: false,
    showPhone: false,
    dataSharing: true,
    personalizedAds: true,
    locationTracking: true,
    activityStatus: true,
  });

  const handleSettingToggle = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handlePrivacyLevelChange = (level: 'public' | 'friends' | 'private') => {
    setPrivacySettings(prev => ({
      ...prev,
      profileVisibility: level
    }));
    Alert.alert('Success', `Profile visibility set to ${level}`);
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'We will prepare your data export and email it to you within 24 hours.',
      [{ text: 'OK' }]
    );
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion request submitted.');
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Privacy</Text>
          
          <View style={styles.privacyLevels}>
            <TouchableOpacity 
              style={[
                styles.privacyLevel,
                privacySettings.profileVisibility === 'public' && styles.privacyLevelSelected
              ]}
              onPress={() => handlePrivacyLevelChange('public')}
            >
              <Ionicons 
                name="earth" 
                size={20} 
                color={privacySettings.profileVisibility === 'public' ? '#0ea5e9' : '#666'} 
              />
              <Text style={styles.privacyLevelText}>Public</Text>
              <Text style={styles.privacyLevelDescription}>Anyone can see your profile</Text>
              {privacySettings.profileVisibility === 'public' && (
                <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.privacyLevel,
                privacySettings.profileVisibility === 'friends' && styles.privacyLevelSelected
              ]}
              onPress={() => handlePrivacyLevelChange('friends')}
            >
              <Ionicons 
                name="people" 
                size={20} 
                color={privacySettings.profileVisibility === 'friends' ? '#0ea5e9' : '#666'} 
              />
              <Text style={styles.privacyLevelText}>Friends Only</Text>
              <Text style={styles.privacyLevelDescription}>Only your connections</Text>
              {privacySettings.profileVisibility === 'friends' && (
                <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.privacyLevel,
                privacySettings.profileVisibility === 'private' && styles.privacyLevelSelected
              ]}
              onPress={() => handlePrivacyLevelChange('private')}
            >
              <Ionicons 
                name="lock-closed" 
                size={20} 
                color={privacySettings.profileVisibility === 'private' ? '#0ea5e9' : '#666'} 
              />
              <Text style={styles.privacyLevelText}>Private</Text>
              <Text style={styles.privacyLevelDescription}>Only you can see your profile</Text>
              {privacySettings.profileVisibility === 'private' && (
                <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Show Email Address</Text>
              <Text style={styles.settingDescription}>Allow others to see your email</Text>
            </View>
            <Switch
              value={privacySettings.showEmail}
              onValueChange={() => handleSettingToggle('showEmail')}
              trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Show Phone Number</Text>
              <Text style={styles.settingDescription}>Allow others to see your phone number</Text>
            </View>
            <Switch
              value={privacySettings.showPhone}
              onValueChange={() => handleSettingToggle('showPhone')}
              trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Data Sharing</Text>
              <Text style={styles.settingDescription}>Help improve our services by sharing usage data</Text>
            </View>
            <Switch
              value={privacySettings.dataSharing}
              onValueChange={() => handleSettingToggle('dataSharing')}
              trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Personalized Ads</Text>
              <Text style={styles.settingDescription}>See ads relevant to your interests</Text>
            </View>
            <Switch
              value={privacySettings.personalizedAds}
              onValueChange={() => handleSettingToggle('personalizedAds')}
              trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Tracking</Text>
              <Text style={styles.settingDescription}>Allow location-based recommendations</Text>
            </View>
            <Switch
              value={privacySettings.locationTracking}
              onValueChange={() => handleSettingToggle('locationTracking')}
              trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Activity Status</Text>
              <Text style={styles.settingDescription}>Show when you're active on the app</Text>
            </View>
            <Switch
              value={privacySettings.activityStatus}
              onValueChange={() => handleSettingToggle('activityStatus')}
              trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dataAction} onPress={handleDataExport}>
            <Ionicons name="download-outline" size={22} color="#0ea5e9" />
            <View style={styles.dataActionInfo}>
              <Text style={styles.dataActionTitle}>Export Your Data</Text>
              <Text style={styles.dataActionDescription}>Download a copy of your personal data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataAction}>
            <Ionicons name="trash-outline" size={22} color="#dc3545" />
            <View style={styles.dataActionInfo}>
              <Text style={styles.dataActionTitle}>Delete Account</Text>
              <Text style={styles.dataActionDescription}>Permanently delete your account and data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={styles.securityTitle}>Your Privacy is Protected</Text>
          </View>
          <Text style={styles.securityText}>
            We use industry-standard encryption to protect your data. Your personal information is never sold to third parties.
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  privacyLevels: {
    flexDirection: 'column',
  },
  privacyLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyLevelSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  privacyLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
  privacyLevelDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  dataAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataActionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dataActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  dataActionDescription: {
    fontSize: 14,
    color: '#666',
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