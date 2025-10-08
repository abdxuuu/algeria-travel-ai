// src/screens/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

type OnboardingItem = {
  title: string;
  description: string;
  image: string;
  isLast?: boolean;
};

const onboardingScreens: OnboardingItem[] = [
  {
    title: "Discover Algeria Like Never Before",
    description: "Explore the beauty of Algeria with AI-powered travel planning. From the Sahara desert to Mediterranean beaches.",
    image: "🇩🇿",
  },
  {
    title: "Your AI Travel Assistant",
    description: "Chat with our intelligent assistant to find perfect trips. Get personalized recommendations based on your preferences.",
    image: "🤖",
  },
  {
    title: "Start Your Journey",
    description: "Join thousands of travelers exploring Algeria. Create your account or explore as a guest.",
    image: "✈️",
    isLast: true,
  }
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentScreen(slide);
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={[styles.screen, { width }]}>
      <View style={styles.imageContainer}>
        <Text style={styles.emoji}>{item.image}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>

      {item.isLast && (
    <View style={styles.authOptions}>
        <CustomButton text="Create Account" onPress={() => navigation.navigate('Signup')} gradient  />
        <CustomButton text="Login" onPress={() => navigation.navigate('Login')} gradient={false} outline />
        <CustomButton text="Continue as Guest" onPress={() => navigation.navigate('GuestHome')} gradient={false} />
    </View>
    )}

    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingScreens.map((_, index) => (
        <View 
          key={index} 
          style={[styles.dot, currentScreen === index ? styles.activeDot : styles.inactiveDot]} 
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Skip Button */}
      {currentScreen < onboardingScreens.length - 1 && (
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => flatListRef.current?.scrollToIndex({ index: onboardingScreens.length - 1 })}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={onboardingScreens}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomSection}>
        {renderDots()}

        {currentScreen < onboardingScreens.length - 1 && (
          <CustomButton 
            text="Next"
            onPress={() => flatListRef.current?.scrollToIndex({ index: currentScreen + 1 })}
            gradient
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  screen: { justifyContent: 'center', alignItems: 'center', padding: 30 },
  imageContainer: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#f0f8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  emoji: { fontSize: 60 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  description: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 25 },
  skipButton: { 
  position: 'absolute', 
  top: 55,           // moved down from 20 → 40
  right: 20, 
  paddingHorizontal: 15, 
  paddingVertical: 8, 
  backgroundColor: '#eee', 
  borderRadius: 20, 
  zIndex: 1,
  shadowColor: '#000', 
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},
  skipText: { fontSize: 16, fontWeight: '600', color: '#666' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
  activeDot: { backgroundColor: '#0066cc', width: 20 },
  inactiveDot: { backgroundColor: '#ddd' },
  bottomSection: { paddingHorizontal: 30, marginBottom: 30 },
  authOptions: { width: '100%', marginTop: 20, gap: 12 },
});
