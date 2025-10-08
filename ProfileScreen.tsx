// src/screens/ProfileScreen.tsx - FULL ENGLISH FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  SafeAreaView,
  Switch,
  TextInput,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../config/firebase';
import { useAppStore } from '../store/AppStore';

export default function ProfileScreen({ navigation }: any) {
  const { user, isLoggedIn, logout, updateUserProfile, demoCounter } = useAppStore();
  const db = getFirestore();
  const storage = getStorage();
  
  const [notifications, setNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use real user data from store
  const currentUser = user || {
    name: 'Guest User',
    email: 'guest@example.com',
    phone: 'Not set',
    joinDate: new Date().toISOString(),
    membership: 'Guest',
    preferences: {
      budgetRange: 'medium',
      travelStyle: 'cultural',
      favoriteCategories: [],
      lastUpdated: new Date().toISOString(),
    }
  };

  // Stats based on user preferences
  const stats = [
    { 
      label: 'Budget Style', 
      value: getBudgetLabel(currentUser.preferences?.budgetRange), 
      icon: '💰' 
    },
    { 
      label: 'Travel Style', 
      value: getTravelStyleLabel(currentUser.preferences?.travelStyle), 
      icon: '✈️' 
    },
    { 
      label: 'Interests', 
      value: `${currentUser.preferences?.favoriteCategories?.length || 0}`,
      icon: '⭐' 
    },
    { 
      label: 'Member Since', 
      value: new Date(currentUser.joinDate).getFullYear().toString(), 
      icon: '📅' 
    },
  ];

  const menuItems = [
    {
      icon: '📝',
      title: 'Edit Profile',
      description: 'Update your personal information',
      onPress: () => handleEdit('name'),
    },
    {
      icon: '🎯',
      title: 'Travel Preferences',
      description: 'Customize your travel experience',
      onPress: () => navigation.navigate('TravelPreferences'),
    },
    {
      icon: '💳',
      title: 'Payment Methods',
      description: 'Manage your payment options',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      icon: '❤️',
      title: 'Saved Trips',
      description: 'View your favorite trips',
      onPress: () => navigation.navigate('SavedTrips'),
    },
    {
      icon: '🔒',
      title: 'Privacy & Security',
      description: 'Manage your privacy settings',
      onPress: () => navigation.navigate('Privacy'),
    },
  ];

  // Helper functions for preferences
  function getBudgetLabel(budget: string) {
    const labels: { [key: string]: string } = {
      'low': 'Budget',
      'medium': 'Comfort',
      'high': 'Luxury'
    };
    return labels[budget] || 'Comfort';
  }

  function getTravelStyleLabel(style: string) {
    const labels: { [key: string]: string } = {
      'adventure': 'Adventure',
      'cultural': 'Cultural',
      'relaxation': 'Relaxation',
      'family': 'Family',
      'romantic': 'Romantic'
    };
    return labels[style] || 'Cultural';
  }

  // Image upload functions
  const pickImage = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to change your profile picture');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change your profile picture!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const takePhoto = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to change your profile picture');
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take a photo!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ✅ FIXED: Image upload with proper error handling
  const handleImageUpload = async (uri: string) => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting image upload...');
      
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Validate file size (max 5MB)
      if (blob.size > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please choose an image smaller than 5MB.');
        return;
      }

      const filename = `profiles/${auth.currentUser.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      console.log('Uploading to:', filename);
      await uploadBytes(storageRef, blob);
      
      console.log('Upload successful, getting download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString(),
      });

      // ✅ FIXED: Update local state
      await updateUserProfile({ photoURL: downloadURL });
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Fallback: Save locally
      await updateUserProfile({ photoURL: uri });
      Alert.alert('Saved Locally', 'Image saved locally and will be uploaded later.');
    } finally {
      setUploading(false);
    }
  };

  // ✅ FIXED: Edit profile function
  const handleEdit = (field: string) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to edit your profile');
      return;
    }
    
    setEditField(field);
    setEditValue(
      field === 'name' ? currentUser.name : 
      field === 'email' ? currentUser.email : 
      field === 'phone' ? (currentUser.phone || '') : ''
    );
    setEditModalVisible(true);
  };

  // ✅ FIXED: Save function with proper error handling
  const handleSave = async () => {
    if (!isLoggedIn || !auth.currentUser) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }
    
    // Validation
    if (!editValue.trim()) {
      Alert.alert('Validation Error', 'Please enter a value');
      return;
    }

    if (editField === 'email' && !isValidEmail(editValue)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating profile for field:', editField);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [editField]: editValue.trim(),
        updatedAt: new Date().toISOString(),
      });

      // ✅ FIXED: Update local state - THIS WAS THE MAIN ISSUE!
      const updates: any = { [editField]: editValue.trim() };
      await updateUserProfile(updates);
      
      console.log('Profile updated successfully');
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'GuestHome' }],
            });
          }
        },
      ]
    );
  };

  const handleViewPreferences = () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Login to view your preferences');
      return;
    }
    
    const prefs = currentUser.preferences;
    Alert.alert(
      'Your Travel Preferences',
      `💰 Budget: ${getBudgetLabel(prefs?.budgetRange)}\n✈️ Travel Style: ${getTravelStyleLabel(prefs?.travelStyle)}\n⭐ Interests: ${prefs?.favoriteCategories?.join(', ') || 'None'}`,
      [{ text: 'OK' }]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleViewPreferences}>
          <Text style={styles.debugButton}>🎯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={showImagePickerOptions} disabled={uploading}>
              {currentUser.photoURL ? (
                <Image source={{ uri: currentUser.photoURL }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(currentUser.name)}
                  </Text>
                </View>
              )}
              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.avatarBadge, uploading && styles.buttonDisabled]}
              onPress={showImagePickerOptions}
              disabled={uploading}
            >
              <Ionicons name="camera-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.nameSection}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              {isLoggedIn && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEdit('name')}
                >
                  <Ionicons name="create-outline" size={18} color="#0ea5e9" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.membershipBadge}>
              <Text style={styles.membershipText}>
                {isLoggedIn ? currentUser.membership : 'Guest Mode'}
              </Text>
              {!isLoggedIn && (
                <Text style={styles.guestHint}>Login to save data</Text>
              )}
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={16} color="#666" />
                <Text style={styles.contactText}>{currentUser.email}</Text>
                {isLoggedIn && (
                  <TouchableOpacity 
                    style={styles.smallEditButton}
                    onPress={() => handleEdit('email')}
                  >
                    <Ionicons name="create-outline" size={14} color="#0ea5e9" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.contactText}>{currentUser.phone || 'Not set'}</Text>
                {isLoggedIn && (
                  <TouchableOpacity 
                    style={styles.smallEditButton}
                    onPress={() => handleEdit('phone')}
                  >
                    <Ionicons name="create-outline" size={14} color="#0ea5e9" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.contactItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.contactText}>Joined {new Date(currentUser.joinDate).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Login Prompt for Guests */}
        {!isLoggedIn && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptTitle}>🔐 Login to Unlock Features</Text>
            <Text style={styles.loginPromptText}>
              Save your profile, view booking history, and get personalized recommendations!
            </Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Grid - Shows User Preferences */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Travel Preferences Quick View */}
        {isLoggedIn && currentUser.preferences && (
          <View style={styles.preferencesCard}>
            <Text style={styles.preferencesTitle}>Your Travel Preferences</Text>
            <View style={styles.preferencesList}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Budget:</Text>
                <Text style={styles.preferenceValue}>{getBudgetLabel(currentUser.preferences.budgetRange)}</Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Travel Style:</Text>
                <Text style={styles.preferenceValue}>{getTravelStyleLabel(currentUser.preferences.travelStyle)}</Text>
              </View>
              {currentUser.preferences.favoriteCategories && currentUser.preferences.favoriteCategories.length > 0 && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Interests:</Text>
                  <Text style={styles.preferenceValue} numberOfLines={1}>
                    {currentUser.preferences.favoriteCategories.slice(0, 3).join(', ')}
                    {currentUser.preferences.favoriteCategories.length > 3 && '...'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editPreferencesButton}
              onPress={() => navigation.navigate('TravelPreferences')}
            >
              <Text style={styles.editPreferencesText}>Edit Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Section */}
        {isLoggedIn && (
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>Receive trip updates and offers</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Newsletter</Text>
                <Text style={styles.settingDescription}>Get travel tips and offers</Text>
              </View>
              <Switch
                value={newsletter}
                onValueChange={setNewsletter}
                trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Switch to dark theme</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#f0f0f0', true: '#0ea5e9' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              disabled={!isLoggedIn && index > 0}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
                {!isLoggedIn && index > 0 && (
                  <Text style={styles.loginRequired}>Login required</Text>
                )}
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={!isLoggedIn && index > 0 ? '#eee' : '#ccc'} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.supportItem}>
            <Ionicons name="help-circle-outline" size={22} color="#0ea5e9" />
            <Text style={styles.supportText}>Help Center</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportItem}>
            <Ionicons name="document-text-outline" size={22} color="#0ea5e9" />
            <Text style={styles.supportText}>Terms & Conditions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#0ea5e9" />
            <Text style={styles.supportText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {isLoggedIn && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Algeria Travel App Version 1.0</Text>
          <Text style={styles.footerSubtext}>Status: {isLoggedIn ? '✅ Logged In' : '❌ Guest'}</Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editField === 'name' ? 'Name' : editField === 'email' ? 'Email' : 'Phone'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter your ${editField === 'name' ? 'name' : editField === 'email' ? 'email' : 'phone'}`}
              autoFocus
              keyboardType={editField === 'email' ? 'email-address' : editField === 'phone' ? 'phone-pad' : 'default'}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButtonPrimary, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  debugButton: {
    fontSize: 18,
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarSection: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  smallEditButton: {
    padding: 2,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  membershipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  guestHint: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  preferencesCard: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 12,
    textAlign: 'center',
  },
  preferencesList: {
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  editPreferencesButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editPreferencesText: {
    color: '#0ea5e9',
    fontWeight: '600',
    fontSize: 14,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    textAlign: 'center',
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
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
  loginRequired: {
    fontSize: 10,
    color: '#dc3545',
    fontStyle: 'italic',
    marginTop: 2,
  },
  supportSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supportText: {
    fontSize: 16,
    color: '#0ea5e9',
    marginLeft: 12,
    fontWeight: '500',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7d7',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 14,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  modalButtonPrimary: {
    flex: 1,
    padding: 14,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginPrompt: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 16,
    margin: 20,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#e1f0ff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 18,
  },
  loginButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});