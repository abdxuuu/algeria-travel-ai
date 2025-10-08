import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking,
  ScrollView 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const ResetPasswordConfirmation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params;

  const openEmailApp = async () => {
    try {
      await Linking.openURL('message://');
    } catch (error) {
      try {
        await Linking.openURL('googlegmail://');
      } catch (error) {
        await Linking.openURL('mailto:');
      }
    }
  };

  const handleResend = () => {
    navigation.navigate('ForgetPassword');
  };

  const handleCreateAccount = () => {
    navigation.navigate('Signup', { preFilledEmail: email });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.title}>Check Your Email</Text>
        
        <Text style={styles.message}>
          We've sent password reset instructions to:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>What to do next:</Text>
          <Text style={styles.instruction}>• Check your email inbox and spam folder</Text>
          <Text style={styles.instruction}>• Open the email from Firebase</Text>
          <Text style={styles.instruction}>• Click the "Reset Password" link</Text>
          <Text style={styles.instruction}>• Create your new password in the browser</Text>
          <Text style={styles.instruction}>• Return here and login with new password</Text>
        </View>

        <TouchableOpacity style={styles.emailButton} onPress={openEmailApp}>
          <Text style={styles.emailButtonText}>Open Email App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={handleResend}
        >
          <Text style={styles.resendButtonText}>
            Didn't receive it? Try with different email
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ResetPasswordConfirmation;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  icon: { 
    fontSize: 70, 
    textAlign: 'center', 
    marginBottom: 25 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
    color: '#333'
  },
  message: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 10, 
    color: '#666',
    lineHeight: 22
  },
  email: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 35,
    color: '#007bff',
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 8,
  },
  instructionsBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  instruction: {
    fontSize: 15,
    marginBottom: 8,
    color: '#555',
    lineHeight: 20,
  },
  emailButton: { 
    backgroundColor: '#007bff', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emailButtonText: { 
    color: 'white', 
    fontSize: 17, 
    fontWeight: 'bold' 
  },
  resendButton: { 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 25 
  },
  resendButtonText: { 
    color: '#007bff', 
    fontSize: 16,
    fontWeight: '500'
  },
  backButton: { 
    padding: 16, 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 25,
  },
  backButtonText: { 
    color: '#666', 
    fontSize: 16 
  }
});