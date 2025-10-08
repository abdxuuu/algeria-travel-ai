// src/screens/SignupScreen.tsx - COMPLETE WITH PRE-FILLED EMAIL SUPPORT
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import CustomButton from '../components/CustomButton';
import { useAppStore } from '../store/AppStore';
import useGoogleAuth from '../hooks/useGoogleAuth';
import { RootStackParamList } from '../AppNavigator';

// Define route props type
type SignupScreenRouteProp = RouteProp<RootStackParamList, 'Signup'>;

// Modern Alert function with emojis
const showModernAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const icons = {
    success: '✅',
    error: '❌', 
    info: 'ℹ️'
  };
  
  Alert.alert(
    `${icons[type]} ${title}`,
    message,
    [{ text: 'OK', style: type === 'error' ? 'cancel' : 'default' }]
  );
};

export default function SignupScreen({ navigation }: any) {
  const route = useRoute<SignupScreenRouteProp>();
  const { preFilledEmail } = route.params || {};

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(preFilledEmail || ''); // AUTO-PRE-FILL EMAIL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Get store actions
  const { signup, checkUsernameAvailability } = useAppStore();
  
  // Social Auth Hooks
  const { promptAsync: googlePrompt, isLoading: googleLoading } = useGoogleAuth();
  
  // Auto-focus email if it was pre-filled
  const emailInputRef = useRef<TextInput>(null);
  
  useEffect(() => {
    if (preFilledEmail && emailInputRef.current) {
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 500);
    }
  }, [preFilledEmail]);

  // Animated borders
  const nameAnim = useRef(new Animated.Value(0)).current;
  const usernameAnim = useRef(new Animated.Value(0)).current;
  const emailAnim = useRef(new Animated.Value(preFilledEmail ? 1 : 0)).current; // Auto-highlight pre-filled email
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordAnim = useRef(new Animated.Value(0)).current;

  const animateBorder = (anim: Animated.Value, focus: boolean) => {
    Animated.timing(anim, {
      toValue: focus ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const inputStyle = (anim: Animated.Value) => ({
    borderColor: anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#ccc', '#0066cc'],
    }),
    borderWidth: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.5],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
  });

  // Check username availability
  const checkUsername = async (value: string) => {
    setUsername(value);
    
    if (value.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(value)) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const available = await checkUsernameAvailability(value);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  // ✅ UPDATED: Navigate to Onboarding1 after successful signup
  const handleSignup = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      showModernAlert('Missing Information', 'Please fill in all fields to continue.', 'error');
      return;
    }

    if (usernameAvailable === false) {
      showModernAlert('Username Taken', 'This username is not available. Please choose another.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showModernAlert('Password Mismatch', 'Passwords do not match. Please check and try again.', 'error');
      return;
    }

    if (password.length < 6) {
      showModernAlert('Weak Password', 'Password should be at least 6 characters long.', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signup({ name, username, email, password });
      
      if (result.success) {
        showModernAlert('Welcome!', result.message, 'success');
        // ✅ NAVIGATE TO ONBOARDING1 AFTER SUCCESS
        setTimeout(() => {
          navigation.navigate('Onboarding1');
        }, 1500); // Wait 1.5 seconds so user can see the success message
      } else {
        showModernAlert('Signup Failed', result.message, 'error');
      }
    } catch (error) {
      showModernAlert('Connection Error', 'Unable to connect. Please check your internet and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSocialLoading('google');
    try {
      await googlePrompt();
    } catch (error: any) {
      console.error('Google signup error:', error);
      if (error.message !== 'Request was cancelled by the user.') {
        showModernAlert('Google Signup Failed', 'Please try again.', 'error');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignup = async () => {
    Alert.alert(
      'Facebook Sign-Up 🔧', 
      'Facebook authentication will be available soon!\n\nFor now, please use email sign-up.',
      [{ text: 'OK' }]
    );
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, text: '', color: '#ccc' };
    if (password.length < 6) return { strength: 33, text: 'Weak', color: '#dc3545' };
    
    let strength = 33;
    let text = 'Fair';
    
    // Check for numbers
    if (/\d/.test(password)) strength += 20;
    // Check for special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    // Check for uppercase and lowercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 14;
    // Check length
    if (password.length >= 8) strength += 13;
    
    strength = Math.min(strength, 100);
    
    if (strength < 50) {
      text = 'Fair';
    } else if (strength < 75) {
      text = 'Good';
    } else {
      text = 'Strong';
    }
    
    const color = strength < 50 ? '#ffc107' : strength < 75 ? '#17a2b8' : '#28a745';
    
    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength();

  const getUsernameStatus = () => {
    if (username.length === 0) return { color: '#666', icon: null, text: '' };
    if (checkingUsername) return { color: '#ffc107', icon: '⏳', text: 'Checking...' };
    if (usernameAvailable === false) return { color: '#dc3545', icon: '❌', text: 'Not available' };
    if (usernameAvailable === true) return { color: '#28a745', icon: '✅', text: 'Available' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { color: '#dc3545', icon: '❌', text: 'Only letters, numbers, _' };
    if (username.length < 3) return { color: '#ffc107', icon: '⚠️', text: 'Min 3 characters' };
    return { color: '#666', icon: null, text: '' };
  };

  const usernameStatus = getUsernameStatus();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Lottie Animation */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../assets/welcome.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Algeria Travel and start your adventure</Text>

        {/* Show welcome message if email was pre-filled */}
        {preFilledEmail && (
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeText}>
              🎉 Welcome! Your email is ready to complete registration
            </Text>
          </View>
        )}

        {/* Social Signup Buttons */}
        <View style={styles.socialButtonsContainer}>
          <Text style={styles.socialTitle}>Quick signup with</Text>
          
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[
                styles.socialButton,
                styles.googleButton,
                socialLoading === 'google' && styles.socialButtonDisabled
              ]}
              onPress={handleGoogleSignup}
              disabled={!!socialLoading || googleLoading}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>
                {socialLoading === 'google' ? 'Connecting...' : 'Google'}
              </Text>
            </TouchableOpacity>

          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Name Input */}
        <Animated.View style={[styles.inputContainer, inputStyle(nameAnim)]}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
            onFocus={() => animateBorder(nameAnim, true)}
            onBlur={() => animateBorder(nameAnim, false)}
            returnKeyType="next"
          />
        </Animated.View>

        {/* Username Input */}
        <Animated.View style={[styles.inputContainer, inputStyle(usernameAnim)]}>
          <Ionicons name="at-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={checkUsername}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => animateBorder(usernameAnim, true)}
            onBlur={() => animateBorder(usernameAnim, false)}
            returnKeyType="next"
          />
        </Animated.View>

        {/* Username Status */}
        {username.length > 0 && (
          <View style={[styles.usernameStatus, { backgroundColor: `${usernameStatus.color}15` }]}>
            <Text style={[styles.usernameStatusText, { color: usernameStatus.color }]}>
              {usernameStatus.icon} {usernameStatus.text}
            </Text>
          </View>
        )}

        {/* Email Input - PRE-FILLED */}
        <Animated.View style={[styles.inputContainer, inputStyle(emailAnim)]}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            ref={emailInputRef}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => animateBorder(emailAnim, true)}
            onBlur={() => animateBorder(emailAnim, false)}
            returnKeyType="next"
            editable={!preFilledEmail} // Make editable only if not pre-filled
          />
          {preFilledEmail && (
            <Ionicons name="checkmark-circle" size={20} color="#28a745" style={styles.lockIcon} />
          )}
        </Animated.View>

        {/* Lock notice if email was pre-filled */}
        {preFilledEmail && (
          <Text style={styles.lockNotice}>
            🔒 Email is pre-filled from password reset. You can't change it here.
          </Text>
        )}

        {/* Password Input */}
        <Animated.View style={[styles.inputContainer, inputStyle(passwordAnim)]}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            onFocus={() => animateBorder(passwordAnim, true)}
            onBlur={() => animateBorder(passwordAnim, false)}
            returnKeyType="next"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.passwordStrengthBar}>
              <View 
                style={[
                  styles.passwordStrengthFill,
                  { width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }
                ]} 
              />
            </View>
            <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
              {passwordStrength.text}
            </Text>
          </View>
        )}

        {/* Confirm Password Input */}
        <Animated.View style={[styles.inputContainer, inputStyle(confirmPasswordAnim)]}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            onFocus={() => animateBorder(confirmPasswordAnim, true)}
            onBlur={() => animateBorder(confirmPasswordAnim, false)}
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && (
          <View style={styles.passwordMatchContainer}>
            <Ionicons 
              name={password === confirmPassword ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={password === confirmPassword ? "#28a745" : "#dc3545"} 
            />
            <Text style={[
              styles.passwordMatchText, 
              { color: password === confirmPassword ? "#28a745" : "#dc3545" }
            ]}>
              {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
            </Text>
          </View>
        )}

        {/* Sign Up Button */}
        <CustomButton
          text={isLoading ? "Creating Account..." : "Create Account"}
          onPress={handleSignup}
          gradient
          disabled={isLoading || usernameAvailable === false || checkingUsername}
          style={styles.signupButton}
        />

        {/* Continue as Guest */}
        <CustomButton
          text="Continue as Guest"
          onPress={() => navigation.navigate('GuestHome')}
          gradient={false}
          style={styles.guestButton}
        />

        {/* Login redirect */}
        <View style={styles.bottomText}>
          <Text style={{ color: '#666' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: '#0066cc', fontWeight: 'bold' }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms Notice */}
        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>

        {/* Security Notice */}
        <Text style={styles.securityNotice}>
          🔒 Your data is securely encrypted and protected
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  lottieContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    textAlign: 'center',
    color: '#1a1a1a'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 25, 
    textAlign: 'center',
    lineHeight: 22
  },
  
  // Welcome Banner for pre-filled email
  welcomeBanner: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  welcomeText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Social Login Styles
  socialButtonsContainer: {
    marginBottom: 20,
  },
  socialTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500'
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  facebookButton: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#333',
  },
  facebookButtonText: {
    color: '#333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginVertical: 6,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    height: 56,
  },
  icon: { 
    marginRight: 12,
    width: 20 
  },
  lockIcon: {
    marginLeft: 8,
  },
  input: { 
    flex: 1, 
    height: '100%', 
    fontSize: 16,
    color: '#1a1a1a'
  },
  eyeButton: {
    padding: 5,
  },
  
  // Lock Notice
  lockNotice: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  // Username Status
  usernameStatus: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 5,
  },
  usernameStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Password Strength
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
    paddingHorizontal: 5,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
  },
  
  // Password Match
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 6,
    paddingHorizontal: 5,
  },
  passwordMatchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Button Styles
  signupButton: {
    marginTop: 15,
  },
  guestButton: {
    marginTop: 12,
  },
  
  bottomText: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 25,
    marginBottom: 15,
    alignItems: 'center'
  },
  
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  
  securityNotice: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic'
  },
});