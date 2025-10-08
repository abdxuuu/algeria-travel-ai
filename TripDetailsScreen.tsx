// src/screens/TripDetailsScreen.tsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, useFavorites } from '../store/AppStore';

const { width } = Dimensions.get('window');

export default function TripDetailsScreen({ route, navigation }: any) {
  const { trip } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, isLoggedIn } = useAppStore();
  const { toggleFavorite, isTripFavorite, loadFavoriteTrips } = useFavorites();

  // Check if trip is favorite
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Update favorite status when component mounts or trip changes
    setIsFavorited(isTripFavorite(trip.id));
  }, [trip.id, isTripFavorite]);

  // Algerian trip descriptions
  const tripDescriptions: { [key: string]: string } = {
    'Djanet Desert Adventure': 'Experience the breathtaking beauty of the Algerian Sahara. Sleep under the stars in traditional Berber camps, ride camels through golden dunes, and witness spectacular sunsets. Includes guided tours to ancient rock art sites and authentic Algerian cuisine.',
    'Bejaia Beach Paradise': 'Discover the stunning Mediterranean coastline of Bejaia. Enjoy crystal-clear waters, pristine beaches, and luxury resort accommodations. Activities include snorkeling, boat tours, and exploring the historic Casbah of Bejaia.',
    'Algiers City Break': 'Immerse yourself in the rich culture and history of Algeria\'s capital. Visit iconic landmarks like the Casbah, Notre Dame d\'Afrique, and the Martyrs\' Memorial. Enjoy authentic Algerian cuisine and vibrant local markets.',
    'Sahara Sunset Camping': 'A magical desert experience with authentic camping under the stars. Enjoy traditional music, Berber hospitality, and the serene beauty of the Sahara at sunset. Perfect for adventure seekers and nature lovers.',
    'Kabylie Mountain Escape': 'Explore the breathtaking landscapes of the Kabylie region. Hike through lush mountains, visit traditional villages, and experience Berber culture. Includes comfortable accommodations and guided nature walks.',
    'Oran Coastal Journey': 'Discover the vibrant port city of Oran with its rich Spanish and French influences. Enjoy beautiful beaches, historic sites, and the famous Rai music scene. Perfect for culture and beach lovers alike.'
  };

  // Enhanced trip features
  const tripFeatures: { [key: string]: string[] } = {
    'Djanet Desert Adventure': [
      '✓ 3 Nights Desert Camping',
      '✓ Camel Riding Experience',
      '✓ Traditional Berber Meals',
      '✓ Guided Rock Art Tour',
      '✓ Sunset & Sunrise Viewing',
      '✓ Local Guide Included'
    ],
    'Bejaia Beach Paradise': [
      '✓ 4-Star Beach Resort',
      '✓ All Meals Included',
      '✓ Snorkeling Equipment',
      '✓ Boat Tour Included',
      '✓ Casbah Guided Tour',
      '✓ Pool & Spa Access'
    ],
    'Algiers City Break': [
      '✓ Central Hotel Accommodation',
      '✓ Breakfast Included',
      '✓ Professional City Guide',
      '✓ All Entrance Fees',
      '✓ Traditional Dinner',
      '✓ Transportation Included'
    ],
    'Sahara Sunset Camping': [
      '✓ 2 Nights Desert Camping',
      '✓ Traditional Berber Tent',
      '✓ Campfire Dinner',
      '✓ Star Gazing Experience',
      '✓ Local Music Performance',
      '✓ 4x4 Desert Transportation'
    ],
    'Kabylie Mountain Escape': [
      '✓ Mountain Lodge Accommodation',
      '✓ All Meals Included',
      '✓ Professional Hiking Guide',
      '✓ Village Visits',
      '✓ Traditional Craft Workshop',
      '✓ Nature Walks Included'
    ],
    'Oran Coastal Journey': [
      '✓ Beachfront Hotel',
      '✓ Breakfast & Dinner',
      '✓ City Tour Guide',
      '✓ Beach Activities',
      '✓ Cultural Sites Entry',
      '✓ Local Music Experience'
    ]
  };

  const onScroll = (event: any) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeIndex) setActiveIndex(slide);
  };

  // Handle favorite toggle with Firebase
  const handleFavoritePress = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save trips to your favorites.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      setLoading(true);
      await toggleFavorite(trip.id);
      setIsFavorited(!isFavorited);
      
      // Show feedback
      if (!isFavorited) {
        Alert.alert('❤️ Added to Favorites', 'Trip saved to your favorites!');
      } else {
        Alert.alert('💔 Removed from Favorites', 'Trip removed from your favorites.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking
  const handleBookPress = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to book this trip.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    navigation.navigate('Booking', { trip });
  };

  const handleAIAssistantPress = () => {
    setModalVisible(true);
  };

  const handleSharePress = () => {
    Alert.alert(
      'Share Trip',
      `Share "${trip.title}" with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => {
            // In a real app, this would use the Share API
            Alert.alert('Shared!', 'Trip shared successfully with your friends.');
          },
        },
      ]
    );
  };

  // Safe image handling
  const images = trip.images && trip.images.length > 0 ? trip.images : [trip.image];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleSharePress}
        >
          <Ionicons name="share-outline" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={styles.carousel}
          >
            {images.map((img: any, index: number) => (
              <Image 
                key={index} 
                source={typeof img === 'string' ? { uri: img } : img} 
                style={styles.image} 
                defaultSource={require('../assets/image1.jpg')}
              />
            ))}
          </ScrollView>

          {/* Favorite Button Overlay */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorited ? "#ef4444" : "#ffffff"} 
              />
            )}
          </TouchableOpacity>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { opacity: i === activeIndex ? 1 : 0.5, transform: [{ scale: i === activeIndex ? 1.2 : 1 }] },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Trip Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{trip.title}</Text>
              <Text style={styles.location}>📍 {trip.location}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.rating}>{trip.rating || 4.5}</Text>
            </View>
          </View>

          {/* Trip Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#0ea5e9" />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{trip.duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="business-outline" size={20} color="#0ea5e9" />
              <Text style={styles.detailLabel}>Agency</Text>
              <Text style={styles.detailValue}>{trip.agency}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={20} color="#0ea5e9" />
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{trip.category}</Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.price}>{trip.price}</Text>
              <Text style={styles.priceNote}>All taxes and fees included</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Best Value</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About This Trip</Text>
            <Text style={styles.description}>
              {tripDescriptions[trip.title] || trip.description || 'An amazing travel experience in beautiful Algeria.'}
            </Text>
          </View>

          {/* Included Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.featuresGrid}>
              {(tripFeatures[trip.title] || [
                '✓ Accommodation',
                '✓ Guided Tours',
                '✓ Meals (as specified)',
                '✓ Transportation',
                '✓ Local Guide',
                '✓ All Entrance Fees'
              ]).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.feature}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Important Information */}
          <View style={styles.importantInfo}>
            <Text style={styles.sectionTitle}>Important Information</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Free cancellation up to 24 hours before trip</Text>
              <Text style={styles.infoItem}>• Confirmation will be received at time of booking</Text>
              <Text style={styles.infoItem}>• Not wheelchair accessible</Text>
              <Text style={styles.infoItem}>• Most travelers can participate</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.aiButton}
              onPress={handleAIAssistantPress}
            >
              <Ionicons name="sparkles" size={20} color="#0ea5e9" />
              <Text style={styles.aiButtonText}>AI Assistant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bookButton} 
              onPress={handleBookPress}
            >
              <Ionicons name="calendar" size={20} color="#ffffff" />
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* AI Assistant Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="sparkles" size={32} color="#0ea5e9" />
              <Text style={styles.modalTitle}>AI Travel Assistant</Text>
            </View>
            
            <Text style={styles.modalText}>
              Our AI assistant can help you with:\n\n• Detailed information about "{trip.title}"\n• Best time to visit {trip.location}\n• Customized itinerary suggestions\n• Local tips and recommendations\n• Answer any questions about this trip
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Maybe Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('AIAssistant', { trip: trip });
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Open AI Assistant</Text>
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
    backgroundColor: '#fff' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop : 45,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  shareButton: {
    padding: 5,
  },
  scrollView: { 
    flex: 1 
  },
  carouselContainer: {
    position: 'relative',
  },
  carousel: { 
    height: 300 
  },
  image: { 
    width: width, 
    height: 300, 
    resizeMode: 'cover' 
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dotsContainer: { 
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#ffffff', 
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: { 
    padding: 20, 
    paddingBottom: 40 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1a1a1a', 
    marginBottom: 8,
    lineHeight: 28,
  },
  location: { 
    fontSize: 16, 
    color: '#0ea5e9', 
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706',
    marginLeft: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  price: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#0ea5e9',
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 14,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: { 
    fontSize: 16, 
    color: '#475569', 
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featuresGrid: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureItem: {
    marginBottom: 12,
  },
  feature: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  importantInfo: {
    marginBottom: 30,
  },
  infoList: {
    backgroundColor: '#fff7ed',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  infoItem: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  aiButton: { 
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff', 
    paddingVertical: 16, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: '#e0f2fe',
    gap: 8,
  },
  bookButton: { 
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9', 
    paddingVertical: 16, 
    borderRadius: 12, 
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  aiButtonText: { 
    color: '#0ea5e9', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  bookButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  modalText: { 
    fontSize: 16, 
    color: '#475569', 
    textAlign: 'center', 
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%',
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
  },
  modalButtonSecondaryText: { 
    color: '#374151', 
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonPrimaryText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
});