// src/screens/VerifyEmailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomButton from '../components/CustomButton';

type Props = {
  navigation: any;
  route: any;
};

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const userEmail = route.params?.email || '';

  // Countdown timer
  useEffect(() => {
    if (timer === 0) {
      setIsResendDisabled(false);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Simulate sending verification code
  const sendCode = () => {
    Alert.alert('Code Sent', `Verification code sent to ${userEmail}`);
    setTimer(60);
    setIsResendDisabled(true);
  };

  // Simulate verifying code
  const verifyCode = () => {
    if (code === '1234') {  // For demo, code is always 1234
      Alert.alert('Success', 'Email verified!');
      navigation.navigate('GuestHome'); // Go to home after verification
    } else {
      Alert.alert('Error', 'Invalid code, try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>Enter the 4-digit code sent to:</Text>
      <Text style={styles.email}>{userEmail}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
        maxLength={4}
      />

      <CustomButton text="Verify" onPress={verifyCode} gradient />

      <TouchableOpacity disabled={isResendDisabled} onPress={sendCode}>
        <Text style={[styles.resendText, isResendDisabled && { color: '#ccc' }]}>
          {isResendDisabled ? `Resend code in ${timer}s` : 'Resend Code'}
        </Text>
      </Toucha
