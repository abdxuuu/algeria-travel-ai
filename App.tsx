import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </NavigationContainer>
  );
}
// Add this at the top of your App.tsx (temporary fix)
import { LogBox } from 'react-native';

// Ignore specific Firebase warnings
LogBox.ignoreLogs([
  'FirebaseError: Firebase: Error (auth/already-initialized)',
  'Setting a timer for a long period of time',
]);
