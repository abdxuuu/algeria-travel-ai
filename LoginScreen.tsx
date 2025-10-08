// src/screens/LoginScreen.tsx - COMPLETE WITH WORKING FORGOT PASSWORD
import React, { useState, useRef } from 'react';
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
import LottieView from 'lottie-react-native';
import CustomButton from '../components/CustomButton';
import { useAppStore } from '../store/AppStore';
import useGoogleAuth from '../hooks/useGoogleAuth';

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

export default function LoginScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  // Get store actions
  const { login } = useAppStore();
  
  // Google Auth Hook
  const { promptAsync: googlePrompt, isLoading: googleLoading } = useGoogleAuth();

  // Animated borders
  const identifierAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;

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

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      showModernAlert('Missing Information', 'Please enter both email/username and password to continue.', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(identifier, password);
      
      if (result.success) {
        showModernAlert('Welcome Back!', result.message, 'success');
        // Navigation will be handled by the auth state listener
      } else {
        showModernAlert('Login Failed', result.message, 'error');
      }
    } catch (error) {
      showModernAlert('Connection Error', 'Unable to connect. Please check your internet and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try {
      await googlePrompt();
    } catch (error: any) {
      console.error('Google login error:', error);
      if (error.message !== 'Request was cancelled by the user.') {
        showModernAlert('Google Login Failed', 'Please try again.', 'error');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    Alert.alert(
      'Coming Soon 🚀', 
      'Facebook login will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

  // ✅ CORRECT FORGOT PASSWORD NAVIGATION - SIMPLE AND WORKING
  const handlePasswordReset = () => {
    console.log('🔄 Navigating to ForgetPassword screen');
    navigation.navigate('ForgetPassword');
  };

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

        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Sign in to your Algeria Travel account</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <Text style={styles.socialTitle}>Quick login with</Text>
          
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[
                styles.socialButton,
                styles.googleButton,
                socialLoading === 'google' && styles.socialButtonDisabled
              ]}
              onPress={handleGoogleLogin}
              disabled={!!socialLoading || googleLoading}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>
                {socialLoading === 'google' ? 'Connecting...' : 'Google'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.socialButton,
                styles.facebookButton,
                styles.socialButtonDisabled
              ]}
              onPress={handleFacebookLogin}
              disabled={true}
            >
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
              <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
                Coming Soon
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Identifier Input */}
        <Animated.View style={[styles.inputContainer, inputStyle(identifierAnim)]}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Email or username"
            value={identifier}
            onChangeText={setIdentifier}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => animateBorder(identifierAnim, true)}
            onBlur={() => animateBorder(identifierAnim, false)}
            returnKeyType="next"
          />
        </Animated.View>

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
            autoCorrect={false}
            onFocus={() => animateBorder(passwordAnim, true)}
            onBlur={() => animateBorder(passwordAnim, false)}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
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

        {/* ✅ FORGOT PASSWORD - NOW WORKING PROPERLY */}
        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={handlePasswordReset}
        >
          <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <CustomButton
          text={isLoading ? "Signing in..." : "Sign In"}
          onPress={handleLogin}
          gradient
          disabled={isLoading}
          style={styles.loginButton}
        />

        {/* Continue as Guest */}
        <CustomButton
          text="Continue as Guest"
          onPress={() => navigation.navigate('GuestHome')}
          gradient={false}
          style={styles.guestButton}
        />

        {/* Signup redirect */}
        <View style={styles.bottomText}>
          <Text style={{ color: '#666' }}>New to Algeria Travel? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={{ color: '#0066cc', fontWeight: 'bold' }}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

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
    marginBottom: 30, 
    textAlign: 'center',
    lineHeight: 22
  },
  
  // Social Login Styles
  socialButtonsContainer: {
    marginBottom: 25,
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
    marginVertical: 8,
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
  input: { 
    flex: 1, 
    height: '100%', 
    fontSize: 16,
    color: '#1a1a1a'
  },
  eyeButton: {
    padding: 5,
  },
  
  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: 5,
    padding: 10, // Better touch area
  },
  forgotPasswordText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Button Styles
  loginButton: {
    marginTop: 10,
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
  
  securityNotice: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic'
  },
});