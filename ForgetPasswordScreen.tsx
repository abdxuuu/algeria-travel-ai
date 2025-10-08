import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/AppStore';

const ForgetPasswordScreen = () => {
  const navigation = useNavigation();
  const { sendRealResetCode, isLoading } = useAppStore();

  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('error');
  const [slideAnim] = useState(new Animated.Value(300));

  const showCustomModal = (message, type = 'error') => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  };

  const hideCustomModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
    });
  };

  const navigateToSignup = () => {
    hideCustomModal();
    navigation.navigate('Signup', { preFilledEmail: email });
  };

  const handleTryDifferentEmail = () => {
    hideCustomModal();
    // Clear the email field and let user try again
    setEmail('');
  };

  const handleSendResetEmail = async () => {
    if (!email) {
      showCustomModal('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showCustomModal('Please enter a valid email address.');
      return;
    }

    const response = await sendRealResetCode(email);
    
    if (response.success) {
      // SUCCESS - Show confirmation screen
      navigation.navigate('ResetPasswordConfirmation', { email });
    } else {
      // Show custom modal with appropriate message
      showCustomModal(response.message, response.emailExists ? 'error' : 'warning');
    }
  };

  const ModalIcon = () => {
    if (modalType === 'success') {
      return <Text style={styles.modalIcon}>✅</Text>;
    } else if (modalType === 'warning') {
      return <Text style={styles.modalIcon}>⚠️</Text>;
    } else {
      return <Text style={styles.modalIcon}>❌</Text>;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          editable={!isLoading}
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSendResetEmail} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Instructions</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Custom Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideCustomModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <ModalIcon />
            <Text style={styles.modalTitle}>
              {modalType === 'success' ? 'Success!' : 
               modalType === 'warning' ? 'Email Not Found' : 'Error'}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            
            <View style={styles.modalButtons}>
              {modalMessage.includes('No account found') ? (
                <>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.signupButton]} 
                    onPress={navigateToSignup}
                  >
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={handleTryDifferentEmail} // FIXED: Now clears email field
                  >
                    <Text style={styles.cancelButtonText}>Try Different Email</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.primaryButton]} 
                  onPress={hideCustomModal}
                >
                  <Text style={styles.primaryButtonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center',
    color: '#333'
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 40, 
    textAlign: 'center', 
    color: '#666',
    lineHeight: 22
  },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    height: 50, 
    fontSize: 16, 
    marginBottom: 25, 
    borderWidth: 1, 
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  button: { 
    height: 50, 
    backgroundColor: '#007bff', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: { 
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  backButton: { 
    padding: 15, 
    alignItems: 'center' 
  },
  backButtonText: { 
    color: '#007bff', 
    fontSize: 16,
    fontWeight: '500'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 50,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    minWidth: '85%',
  },
  modalIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
    lineHeight: 22,
  },
  modalButtons: {
    width: '100%',
  },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#28a745',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});