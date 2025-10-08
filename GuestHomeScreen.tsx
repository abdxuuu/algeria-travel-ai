// src/screens/GuestHomeScreen.tsx - COMPLETE UPDATED VERSION
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function GuestHomeScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const categories = ['All', 'Beach', 'Mountain', 'City', 'Desert', 'Cultural'];

  // Using real Unsplash images for Algerian destinations
  const featuredTrips = [
    {
      id: '1',
      title: 'Djanet Desert Adventure',
      duration: '7 days • All inclusive camp',
      price: '89,000 DA',
      location: 'Djanet, Algeria',
      agency: 'Sahara Travels',
      rating: 4.8,
      description: 'Experience the magic of the Sahara desert with guided tours, camel rides, and traditional Berber camps.',
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
      category: 'Desert'
    },
    {
      id: '2',
      title: 'Bejaia Beach Paradise',
      duration: '5 days • Resort included',
      price: '62,000 DA',
      location: 'Bejaia, Algeria',
      agency: 'Coastal Tours',
      rating: 4.9,
      description: 'Relax on pristine Mediterranean beaches with luxury resort accommodation and water activities.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      category: 'Beach'
    },
    {
      id: '3',
      title: 'Algiers City Break',
      duration: '3 days • Hotel & tours',
      price: '45,000 DA',
      location: 'Algiers, Algeria',
      agency: 'Urban Travels',
      rating: 4.6,
      description: 'Explore the rich history and culture of Algiers with guided city tours and authentic cuisine.',
      image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400',
      category: 'City'
    },
  ];

  const recommendedTrips = [
    {
      id: '4',
      title: 'Sahara Sunset Camping',
      duration: '4 days • Guided tours',
      price: '55,000 DA',
      location: 'Hassilabied, Algeria',
      agency: 'Sahara Travels',
      rating: 4.7,
      description: 'Witness breathtaking sunsets in the Sahara with authentic camping experience.',
      image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400',
      category: 'Desert'
    },
    {
      id: '5',
      title: 'Kabylie Mountain Escape',
      duration: '6 days • All inclusive',
      price: '70,000 DA',
      location: 'Tizi-Ouzou, Algeria',
      agency: 'Mountain Adventures',
      rating: 4.8,
      description: 'Discover the beautiful Kabylie mountains with hiking trails and traditional villages.',
      image: 'https://images.unsplash.com/photo-1464822759844-d1503da2fce4?w=400',
      category: 'Mountain'
    },
    {
      id: '6',
      title: 'Oran Coastal Journey',
      duration: '4 days • Hotel & meals',
      price: '48,000 DA',
      location: 'Oran, Algeria',
      agency: 'Coastal Tours',
      rating: 4.5,
      description: 'Enjoy the vibrant city of Oran with its beautiful coastline and cultural sites.',
      image: 'https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=400',
      category: 'City'
    },
    {
      id: '7',
      title: 'Constantine City of Bridges',
      duration: '3 days • Guided tours',
      price: '52,000 DA',
      location: 'Constantine, Algeria',
      agency: 'Historic Tours',
      rating: 4.7,
      description: 'Explore the stunning city built on cliffs with magnificent bridges and rich history.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      category: 'Cultural'
    },
  ];

  const handleBookPress = (trip: any) => {
    setSelectedTrip(trip);
    setModalVisible(true);
  };

  const handleAIAssistantPress = () => {
    setModalVisible(true);
  };

  const handleTripPress = (trip: any) => {
    navigation.navigate('TripDetails', { trip });
  };

  const handleSignUpPress = () => {
    setModalVisible(false);
    navigation.navigate('Signup');
  };

  const handleLoginPress = () => {
    setModalVisible(false);
    navigation.navigate('Login');
  };

  const filteredFeaturedTrips = selectedCategory === 'All' 
    ? featuredTrips 
    : featuredTrips.filter(trip => trip.category === selectedCategory);

  const filteredRecommendedTrips = selectedCategory === 'All'
    ? recommendedTrips
    : recommendedTrips.filter(trip => trip.category === selectedCategory);

  const allTrips = [...featuredTrips, ...recommendedTrips];
  const filteredTrips = selectedCategory === 'All' 
    ? allTrips 
    : allTrips.filter(trip => trip.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Welcome to Algeria! 🇩🇿</Text>
            <Text style={styles.userName}>Discover Amazing Trips</Text>
          </View>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* AI Assistant Card */}
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={handleAIAssistantPress}
        >
          <View style={styles.aiContent}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>AI Travel Assistant</Text>
              <Text style={styles.aiSubtitle}>Get personalized trip recommendations</Text>
            </View>
            <View style={styles.arrowIcon}>
              <Ionicons name="chevron-forward" size={20} color="#0ea5e9" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allTrips.length}+</Text>
            <Text style={styles.statLabel}>Amazing Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5+</Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.7★</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌟 Featured Trips</Text>
            <TouchableOpacity onPress={() => setSelectedCategory('All')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredFeaturedTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No trips found in this category</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.tripsContainer}
            >
              {filteredFeaturedTrips.map((trip) => (
                <TouchableOpacity 
                  key={trip.id} 
                  style={styles.tripCard}
                  onPress={() => handleTripPress(trip)}
                >
                  <View style={styles.tripImageContainer}>
                    <Image 
                      source={{ uri: trip.image }} 
                      style={styles.tripImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingText}>{trip.rating}</Text>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{trip.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripTitle} numberOfLines={2}>{trip.title}</Text>
                    <View style={styles.tripLocation}>
                      <Ionicons name="location-outline" size={12} color="#6b7280" />
                      <Text style={styles.locationText}>{trip.location}</Text>
                    </View>
                    <Text style={styles.tripDuration}>{trip.duration}</Text>
                    <Text style={styles.tripAgency}>By {trip.agency}</Text>
                    
                    <View style={styles.tripFooter}>
                      <Text style={styles.tripPrice}>{trip.price}</Text>
                      <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={() => handleBookPress(trip)}
                      >
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recommended Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💫 Recommended for You</Text>
            <TouchableOpacity onPress={() => setSelectedCategory('All')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredRecommendedTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="compass-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Try another category</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.tripsContainer}
            >
              {filteredRecommendedTrips.map((trip) => (
                <TouchableOpacity 
                  key={trip.id} 
                  style={styles.tripCard}
                  onPress={() => handleTripPress(trip)}
                >
                  <View style={styles.tripImageContainer}>
                    <Image 
                      source={{ uri: trip.image }} 
                      style={styles.tripImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingText}>{trip.rating}</Text>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{trip.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripTitle} numberOfLines={2}>{trip.title}</Text>
                    <View style={styles.tripLocation}>
                      <Ionicons name="location-outline" size={12} color="#6b7280" />
                      <Text style={styles.locationText}>{trip.location}</Text>
                    </View>
                    <Text style={styles.tripDuration}>{trip.duration}</Text>
                    <Text style={styles.tripAgency}>By {trip.agency}</Text>
                    
                    <View style={styles.tripFooter}>
                      <Text style={styles.tripPrice}>{trip.price}</Text>
                      <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={() => handleBookPress(trip)}
                      >
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Popular Agencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Trusted Agencies</Text>
          <View style={styles.agenciesContainer}>
            <View style={styles.agencyCard}>
              <View style={styles.agencyIcon}>
                <Ionicons name="business-outline" size={24} color="#0ea5e9" />
              </View>
              <Text style={styles.agencyName}>Sahara Travels</Text>
              <Text style={styles.agencyTrips}>12+ Desert Trips</Text>
            </View>
            
            <View style={styles.agencyCard}>
              <View style={styles.agencyIcon}>
                <Ionicons name="beach-outline" size={24} color="#0ea5e9" />
              </View>
              <Text style={styles.agencyName}>Coastal Tours</Text>
              <Text style={styles.agencyTrips}>8+ Beach Trips</Text>
            </View>
            
            <View style={styles.agencyCard}>
              <View style={styles.agencyIcon}>
                <Ionicons name="trail-sign-outline" size={24} color="#0ea5e9" />
              </View>
              <Text style={styles.agencyName}>Mountain Adventures</Text>
              <Text style={styles.agencyTrips}>6+ Mountain Trips</Text>
            </View>
          </View>
        </View>

        {/* Sign Up CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Ready to Explore Algeria?</Text>
              <Text style={styles.ctaText}>
                Sign up to save trips, get personalized recommendations, and book your next adventure!
              </Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={handleSignUpPress}
              >
                <Text style={styles.ctaButtonText}>Create Free Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Modal for booking/AI assistant */}
      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons 
                name={selectedTrip ? "calendar" : "sparkles"} 
                size={32} 
                color="#0ea5e9" 
              />
              <Text style={styles.modalTitle}>
                {selectedTrip ? 'Ready to Book?' : 'AI Assistant'}
              </Text>
            </View>
            
            <Text style={styles.modalText}>
              {selectedTrip 
                ? `To book "${selectedTrip.title}" and access all premium features, create your free account.`
                : 'Get personalized travel recommendations and AI-powered trip planning with your free account.'
              }
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Continue as Guest</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={handleSignUpPress}
              >
                <Text style={styles.modalButtonPrimaryText}>Sign Up Free</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={handleLoginPress}
            >
              <Text style={styles.loginLinkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerText: {
    flex: 1,
  },
  greeting: { 
    fontSize: 16, 
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1a1a1a',
    lineHeight: 32,
  },
  loginButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiCard: { 
    backgroundColor: '#f0f9ff', 
    marginHorizontal: 20, 
    marginVertical: 15,
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#e0f2fe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  aiIcon: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#0ea5e9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiText: { 
    flex: 1 
  },
  aiTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#0369a1', 
    marginBottom: 4 
  },
  aiSubtitle: { 
    fontSize: 14, 
    color: '#64748b' 
  },
  arrowIcon: { 
    padding: 5 
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  categoriesSection: {
    marginVertical: 10,
  },
  categoriesScroll: { 
    marginVertical: 10 
  },
  categoriesContainer: { 
    paddingHorizontal: 20 
  },
  categoryButton: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 20, 
    backgroundColor: '#f8fafc', 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  categoryButtonActive: { 
    backgroundColor: '#0ea5e9', 
    borderColor: '#0ea5e9' 
  },
  categoryText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#64748b' 
  },
  categoryTextActive: { 
    color: '#ffffff' 
  },
  section: { 
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1a1a1a',
  },
  seeAllText: {
    color: '#0ea5e9',
    fontWeight: '600',
    fontSize: 14,
  },
  tripsContainer: { 
    paddingHorizontal: 15
  },
  tripCard: { 
    width: 280, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    marginRight: 15, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tripImageContainer: {
    position: 'relative',
  },
  tripImage: { 
    width: '100%', 
    height: 160,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  tripInfo: { 
    padding: 16 
  },
  tripTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },
  tripLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: { 
    fontSize: 13, 
    color: '#6b7280', 
    marginLeft: 4,
  },
  tripDuration: { 
    fontSize: 13, 
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  tripAgency: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripPrice: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#0ea5e9' 
  },
  bookButton: { 
    backgroundColor: '#0ea5e9', 
    paddingHorizontal: 16,
    paddingVertical: 8, 
    borderRadius: 8,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  agenciesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  agencyCard: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    width: (width - 80) / 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  agencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  agencyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  agencyTrips: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  ctaCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    alignItems: 'center',
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  modalBackground: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: { 
    width: '100%', 
    maxWidth: 400,
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
    textAlign: 'center',
  },
  modalText: { 
    fontSize: 16, 
    color: '#64748b', 
    textAlign: 'center', 
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  modalButtonSecondary: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  modalButtonPrimary: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#0ea5e9', 
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonSecondaryText: { 
    color: '#374151', 
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonPrimaryText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginLink: {
    padding: 8,
  },
  loginLinkText: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600',
  },
});