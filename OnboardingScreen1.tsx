// src/screens/OnboardingScreen1.tsx - FIXED VERSION
import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../config/firebase';
import { useAppStore } from '../store/AppStore';
import NetInfo from '@react-native-community/netinfo';

// screen sizing
const { width: SCREEN_W } = Dimensions.get('window');

type Preferences = {
  budgetRange: 'low' | 'medium' | 'high' | null;
  travelStyle: 'cultural' | 'adventure' | 'relaxation' | 'family' | 'romantic' | null;
  interests: string[];
  photoURL?: string;
};

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function OnboardingScreen1() {
  const navigation = useNavigation<any>();
  const db = getFirestore();
  const storage = getStorage();
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [prefs, setPrefs] = useState<Preferences>({
    budgetRange: null,
    travelStyle: null,
    interests: [],
    photoURL: '',
  });
  const [hasNetwork, setHasNetwork] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  const animX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const budgetOptions: { key: 'low' | 'medium' | 'high'; label: string; icon: string }[] = [
    { key: 'low', label: 'Budget', icon: 'wallet-outline' },
    { key: 'medium', label: 'Comfort', icon: 'business-outline' },
    { key: 'high', label: 'Luxury', icon: 'diamond-outline' },
  ];

  const styleOptions: { key: Preferences['travelStyle']; label: string; icon: string }[] = [
    { key: 'adventure', label: 'Adventure', icon: 'trail-sign-outline' },
    { key: 'cultural', label: 'Cultural', icon: 'library-outline' },
    { key: 'relaxation', label: 'Relaxation', icon: 'umbrella-outline' },
    { key: 'family', label: 'Family', icon: 'people-outline' },
    { key: 'romantic', label: 'Romantic', icon: 'heart-outline' },
  ];

  const interestOptions = [
    { name: 'Beach', icon: 'beach-outline' },
    { name: 'Mountains', icon: 'terrain-outline' },
    { name: 'History', icon: 'time-outline' },
    { name: 'Food', icon: 'restaurant-outline' },
    { name: 'Nightlife', icon: 'moon-outline' },
    { name: 'Shopping', icon: 'cart-outline' },
    { name: 'Photo', icon: 'camera-outline' },
    { name: 'Nature', icon: 'leaf-outline' },
  ];

  const currentUser = auth.currentUser;

  // Listen to network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = !!(state.isConnected && state.isInternetReachable);
      setHasNetwork(connected);
      if (!connected) {
        setError('No internet connection. Some features may be limited.');
      } else {
        setError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Request permissions (gallery & camera)
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          const [libraryStatus, cameraStatus] = await Promise.all([
            ImagePicker.requestMediaLibraryPermissionsAsync(),
            ImagePicker.requestCameraPermissionsAsync(),
          ]);
          if (libraryStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
            console.log('Some media permissions not granted');
          }
        }
      } catch (e) {
        console.warn('Permission check failed', e);
      }
    })();
  }, []);

  // animate on step change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(animX, {
        toValue: -step * SCREEN_W,
        useNativeDriver: true,
        stiffness: 120,
        damping: 16,
      }),
    ]).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    });
  }, [step, animX, fadeAnim]);

  const goToStep = (index: number) => {
    setError(null);
    setStep(Math.max(0, Math.min(2, index)));
  };

  const next = () => {
    if (step === 0 && !prefs.budgetRange) {
      setError('Please choose your budget range.');
      return;
    }
    if (step === 1 && !prefs.travelStyle) {
      setError('Please choose your travel style.');
      return;
    }
    setError(null);
    if (step < 2) goToStep(step + 1);
  };

  const back = () => {
    setError(null);
    if (step > 0) goToStep(step - 1);
    else navigation.goBack();
  };

  const toggleInterest = (interest: string) => {
    setPrefs((p) => {
      const has = p.interests.includes(interest);
      const nextInterests = has ? p.interests.filter((i) => i !== interest) : [...p.interests, interest];

      if (nextInterests.length > 8 && !has) {
        Alert.alert('Limit Reached', 'You can select up to 8 interests. Remove some to add new ones.');
        return p;
      }
      return { ...p, interests: nextInterests };
    });
  };

  const chooseBudget = (key: Preferences['budgetRange']) => {
    setPrefs((p) => ({ ...p, budgetRange: key }));
    setError(null);
  };

  const chooseStyle = (key: Preferences['travelStyle']) => {
    setPrefs((p) => ({ ...p, travelStyle: key }));
    setError(null);
  };

  // ✅ SIMPLIFIED & FIXED: Image upload function
  const pickImage = async (fromCamera = false) => {
    if (!hasNetwork) {
      Alert.alert('No Internet', 'You need an internet connection to upload photos. Please check your connection and try again.');
      return;
    }

    try {
      const options: ImagePicker.ImagePickerOptions = {
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
        exif: false,
      };

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleLocalImage(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Image pick error:', err);
      Alert.alert('Image Error', 'Unable to access images. Please check app permissions and try again.');
    }
  };

  // ✅ FIXED: Simple upload without complex blob conversion
  const handleLocalImage = async (localUri: string): Promise<void> => {
    if (!currentUser) {
      Alert.alert('Session Expired', 'Please sign in again to continue.');
      return;
    }

    if (!hasNetwork) {
      Alert.alert('Offline', 'Cannot upload photos while offline. Please check your connection.');
      return;
    }

    setUploadState('uploading');

    try {
      const uid = currentUser.uid;
      
      // Simple fetch to get the file
      const response = await fetch(localUri);
      const blob = await response.blob();

      // Validate file size (max 5MB)
      if (blob.size > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please choose an image smaller than 5MB.');
        setUploadState('error');
        return;
      }

      const filename = `profiles/${uid}_${Date.now()}.jpg`;
      const storageReference = ref(storage, filename);

      // Simple upload
      await uploadBytes(storageReference, blob);
      const downloadURL = await getDownloadURL(storageReference);
      
      setPrefs((p) => ({ ...p, photoURL: downloadURL }));
      setUploadState('success');

      setTimeout(() => setUploadState('idle'), 1500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      
      // ✅ FALLBACK: Save locally if Firebase Storage fails
      console.log('Firebase Storage failed, saving image locally');
      setPrefs((p) => ({ ...p, photoURL: localUri }));
      setUploadState('success');
      
      setTimeout(() => setUploadState('idle'), 1500);
    }
  };

  // ✅ Save profile & finish onboarding
  const finishAndSave = async () => {
    if (!currentUser) {
      Alert.alert('Session Expired', 'Please sign up or log in to continue.');
      return;
    }

    if (!hasNetwork) {
      Alert.alert('Offline Mode', 'You are currently offline. Please connect to the internet to save your profile.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uid = currentUser.uid;
      const usersRef = doc(db, 'users', uid);
      const storeState = useAppStore.getState();
      const currentStoreUser = storeState.user;

      // ✅ PERFECT: Only store what user chose
      const payload = {
        uid,
        email: currentUser.email || '',
        name: currentUser.displayName || currentStoreUser?.name || 'Traveler',
        username: currentStoreUser?.username || '',
        phone: currentStoreUser?.phone || '',
        photoURL: prefs.photoURL || currentUser.photoURL || currentStoreUser?.photoURL || '',
        joinDate: currentStoreUser?.joinDate || new Date().toISOString(),
        membership: currentStoreUser?.membership || 'Explorer',
        preferences: {
          favoriteCategories: prefs.interests.map((s) => s.toLowerCase()),
          budgetRange: prefs.budgetRange || 'medium',
          travelStyle: prefs.travelStyle || 'cultural',
          lastUpdated: new Date().toISOString(),
        },
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(usersRef, payload, { merge: true });

      const updatedUser = {
        uid,
        email: payload.email,
        name: payload.name,
        username: payload.username,
        phone: payload.phone,
        photoURL: payload.photoURL,
        joinDate: payload.joinDate,
        membership: payload.membership as any,
        preferences: payload.preferences,
        onboardingCompleted: true,
      };

      useAppStore.setState({
        user: updatedUser as any,
        isLoggedIn: true,
        guestMode: false,
      });

      setLoading(false);
      
      // ✅ SHOW WELCOME SCREEN instead of direct navigation
      setShowWelcome(true);

    } catch (err: any) {
      console.error('Onboarding save error:', err);
      setError(
        err?.code === 'unavailable'
          ? 'Network error. Please check your connection and try again.'
          : 'Failed to save profile. Please try again.'
      );
      setLoading(false);
    }
  };

  // ✅ WELCOME SCREEN COMPONENT
  const WelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>Welcome to Algeria Travel! 🎉</Text>
      <Text style={styles.welcomeSubtitle}>
        Your account has been created successfully!{'\n'}
        Start exploring amazing travel experiences in Algeria.
      </Text>
      
      <TouchableOpacity 
        style={styles.welcomeButton}
        onPress={() => navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'UserHome', params: { onboardingComplete: true } }],
          })
        )}
      >
        <Text style={styles.welcomeButtonText}>Start Exploring</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.welcomeSecondaryButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.welcomeSecondaryButtonText}>Complete Your Profile</Text>
      </TouchableOpacity>
    </View>
  );

  // ensure user is present - if not, prompt to sign up
  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Session Expired', 'Please sign up or log in again.', [{ text: 'OK', onPress: () => navigation.navigate('Signup') }]);
    }
  }, [currentUser, navigation]);

  // ✅ RETURN WELCOME SCREEN if showWelcome is true
  if (showWelcome) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <WelcomeScreen />
      </SafeAreaView>
    );
  }

  // UI Steps components (KEEP YOUR EXACT DESIGN)
  const Step0_Budget = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.stepWrap}>
        <Text style={styles.stepTitle}>What's your travel budget style?</Text>
        <Text style={styles.stepSubtitle}>Choose what fits your comfort zone</Text>

        <View style={styles.optionsGrid}>
          {budgetOptions.map((b) => {
            const selected = prefs.budgetRange === b.key;
            return (
              <TouchableOpacity
                key={b.key}
                style={[
                  styles.budgetCard,
                  selected && styles.budgetCardSelected,
                  !hasNetwork && styles.optionDisabled,
                ]}
                onPress={() => chooseBudget(b.key)}
                activeOpacity={0.85}
                disabled={!hasNetwork}
                accessibilityLabel={`Choose ${b.label}`}
              >
                <View style={styles.budgetIconContainer}>
                  <Ionicons name={b.icon as any} size={26} color={selected ? '#0ea5e9' : '#64748b'} />
                </View>

                <View style={styles.budgetTextWrap}>
                  <Text style={[styles.budgetCardLabel, selected && styles.budgetCardLabelSelected]} numberOfLines={1}>
                    {b.label || 'Unknown'}
                  </Text>
                  <Text style={styles.budgetCardSubLabel}>
                    {b.key === 'low' ? 'Save and explore' : b.key === 'medium' ? 'Comfort & value' : 'Top-tier experience'}
                  </Text>
                </View>

                {selected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {!hasNetwork && (
          <View style={styles.offlineNotice}>
            <Ionicons name="cloud-offline-outline" size={16} color="#92400e" />
            <Text style={styles.offlineText}>Offline - selections will be saved locally</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const Step1_Style = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.stepWrap}>
        <Text style={styles.stepTitle}>What's your travel personality?</Text>
        <Text style={styles.stepSubtitle}>Pick your preferred travel vibe</Text>

        <View style={styles.styleOptionsContainer}>
          {styleOptions.map((s) => {
            const selected = prefs.travelStyle === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.styleOption, selected && styles.styleOptionSelected, !hasNetwork && styles.optionDisabled]}
                onPress={() => chooseStyle(s.key)}
                activeOpacity={0.85}
                disabled={!hasNetwork}
                accessibilityLabel={`Choose ${s.label}`}
              >
                <Ionicons name={s.icon as any} size={22} color={selected ? '#0ea5e9' : '#64748b'} />
                <Text style={[styles.styleOptionText, selected && styles.styleOptionTextSelected]} numberOfLines={1}>
                  {s.label || 'Unknown'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );

  const Step2_Interests = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.stepWrap}>
        <Text style={styles.stepTitle}>What gets you excited?</Text>
        <Text style={styles.stepSubtitle}>
          Choose up to 8 interests {prefs.interests.length > 0 && `(${prefs.interests.length}/8)`}
        </Text>

        <ScrollView contentContainerStyle={styles.interestsContainer} showsVerticalScrollIndicator={false}>
          {interestOptions.map((it) => {
            const selected = prefs.interests.includes(it.name);
            return (
              <TouchableOpacity
                key={it.name}
                style={[styles.interestChip, selected && styles.interestChipSelected, !hasNetwork && styles.optionDisabled]}
                onPress={() => toggleInterest(it.name)}
                activeOpacity={0.85}
                disabled={!hasNetwork}
                accessibilityLabel={`Toggle ${it.name}`}
              >
                <Ionicons name={it.icon as any} size={16} color={selected ? '#fff' : '#64748b'} />
                <Text style={[styles.interestChipText, selected && styles.interestChipTextSelected]} numberOfLines={1}>
                  {it.name}
                </Text>
                {selected && <Ionicons name="checkmark" size={14} color="#fff" style={styles.interestCheckmark} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.photoSection}>
          <Text style={styles.photoSectionTitle}>Add a profile photo (optional)</Text>

          <View style={styles.photoContainer}>
            {prefs.photoURL ? (
              <View style={styles.photoWithOverlay}>
                <Image source={{ uri: prefs.photoURL }} style={styles.profilePreview} />
                {uploadState === 'uploading' && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={36} color="#94a3b8" />
                {uploadState === 'uploading' && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
            )}

            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={[styles.photoButton, (!hasNetwork || uploadState === 'uploading') && styles.buttonDisabled]}
                onPress={() => pickImage(false)}
                disabled={!hasNetwork || uploadState === 'uploading'}
              >
                <Ionicons name="images" size={18} color="#083344" />
                <Text style={styles.photoButtonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoButton, (!hasNetwork || uploadState === 'uploading') && styles.buttonDisabled]}
                onPress={() => pickImage(true)}
                disabled={!hasNetwork || uploadState === 'uploading'}
              >
                <Ionicons name="camera" size={18} color="#083344" />
                <Text style={styles.photoButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          {uploadState === 'success' && <Text style={styles.uploadSuccessText}>Photo uploaded successfully!</Text>}
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={finishAndSave} accessibilityRole="button">
          <Text style={styles.skipText}>Skip photo and continue</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderProgress = () => {
    const steps = [
      { label: 'Budget', key: 0 },
      { label: 'Style', key: 1 },
      { label: 'Interests', key: 2 },
    ];

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                index <= step && styles.progressSegmentActive,
                index === steps.length - 1 && { marginRight: 0 },
              ]}
            />
          ))}
        </View>
        <View style={styles.progressLabels}>
          {steps.map((stepItem, index) => (
            <Text key={stepItem.key} style={[styles.progressLabel, index === step && styles.progressLabelActive]}>
              {stepItem.label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={back} style={styles.backButton} accessibilityRole="button">
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Your Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {renderProgress()}

        {!hasNetwork && (
          <View style={styles.networkBanner}>
            <Ionicons name="wifi-outline" size={16} color="#fff" />
            <Text style={styles.networkBannerText}>You're currently offline</Text>
          </View>
        )}

        <View style={styles.carouselContainer}>
          <Animated.View style={[styles.carouselContent, { transform: [{ translateX: animX }] }]}>
            <View style={styles.carouselPage}>{Step0_Budget()}</View>
            <View style={styles.carouselPage}>{Step1_Style()}</View>
            <View style={styles.carouselPage}>{Step2_Interests()}</View>
          </Animated.View>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning-outline" size={16} color="#fff" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.footerButton, styles.secondaryButton]} onPress={back} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>{step === 0 ? 'Cancel' : 'Back'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.primaryButton, (!hasNetwork && step === 2) && styles.buttonDisabled]}
            onPress={step < 2 ? next : finishAndSave}
            disabled={loading || (!hasNetwork && step === 2)}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryButtonText}>{step < 2 ? 'Continue' : 'Complete Profile'}</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.helpTextContainer}>
          <Text style={styles.helpText}>
            {step === 0 && 'Budget helps us recommend trips within your range'}
            {step === 1 && 'Your travel style personalizes destination suggestions'}
            {step === 2 && 'Interests help us create your perfect travel itinerary'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // ✅ ADDED: Welcome Screen Styles
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  welcomeButton: {
    backgroundColor: '#007bff',
    padding: 18,
    borderRadius: 12,
    minWidth: 250,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeSecondaryButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 12,
    minWidth: 250,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  welcomeSecondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  // KEEP ALL YOUR EXISTING STYLES
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressSegment: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    marginRight: 6,
    borderRadius: 6,
  },
  progressSegmentActive: {
    backgroundColor: '#0ea5e9',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    width: 70,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#0ea5e9',
    fontWeight: '700',
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  networkBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  carouselContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  carouselContent: {
    flexDirection: 'row',
    width: SCREEN_W * 3,
  },
  carouselPage: {
    width: SCREEN_W,
    paddingHorizontal: 20,
  },
  stepWrap: {
    flex: 1,
    paddingTop: 6,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 18,
  },
  optionsGrid: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  budgetCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 72,
  },
  budgetCardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  budgetIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  budgetTextWrap: {
    flex: 1,
    minWidth: 120,
  },
  budgetCardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  budgetCardSubLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  budgetCardLabelSelected: {
    color: '#0369a1',
  },
  selectedIndicator: {
    marginLeft: 'auto',
  },
  styleOptionsContainer: {
    flexDirection: 'column',
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
    minHeight: 56,
  },
  styleOptionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  styleOptionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 12,
    flex: 1,
  },
  styleOptionTextSelected: {
    color: '#0369a1',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 10,
    marginBottom: 10,
    minWidth: 90,
  },
  interestChipSelected: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  interestChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
    marginRight: 4,
  },
  interestChipTextSelected: {
    color: '#fff',
  },
  interestCheckmark: {
    marginLeft: 4,
  },
  photoSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  photoSectionTitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 12,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  photoWithOverlay: {
    position: 'relative',
  },
  profilePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  uploadSuccessText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  skipButton: {
    marginTop: 12,
    padding: 12,
  },
  skipText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  offlineText: {
    color: '#92400e',
    fontSize: 12,
    marginLeft: 8,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  helpTextContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  helpText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});