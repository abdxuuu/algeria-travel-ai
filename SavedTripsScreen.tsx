// src/screens/SavedTripsScreen.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, useFavorites, useTrips } from '../store/AppStore';

const { width } = Dimensions.get('window');

export default function SavedTripsScreen({ navigation }: any) {
  const { user, isLoggedIn } = useAppStore();
  const { allTrips } = useTrips();
  const { favoriteTrips, toggleFavorite, loadFavoriteTrips } = useFavorites();

  // Load favorites when screen focuses
  useEffect(() => {
    loadFavoriteTrips();
  }, []);

  // Refresh when screen comes into focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavoriteTrips();
    });

    return unsubscribe;
  }, [navigation]);

  const handleRemoveTrip = async (tripId: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this trip from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeTripFromFavorites(tripId),
        },
      ]
    );
  };

  const removeTripFromFavorites = async (tripId: string) => {
    try {
      await toggleFavorite(tripId);
      Alert.alert('Success', 'Trip removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove trip from favorites');
    }
  };

  const handleBookTrip = (trip: any) => {
    navigation.navigate('Booking', { trip });
  };

  const handleViewTripDetails = (trip: any) => {
    navigation.navigate('TripDetails', { trip });
  };

  const handleShareTrip = (trip: any) => {
    Alert.alert(
      'Share Trip',
      `Share "${trip.title}" with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => {
            Alert.alert('Shared!', 'Trip shared successfully');
          },
        },
      ]
    );
  };

  const getTripStats = () => {
    const categories = [...new Set(favoriteTrips.map(trip => trip.category))];
    const totalPrice = favoriteTrips.reduce((sum, trip) => {
      const price = parseInt(trip.price.replace(/[^0-9]/g, '')) || 0;
      return sum + price;
    }, 0);
    
    return {
      totalTrips: favoriteTrips.length,
      categories: categories.length,
      totalValue: `${(totalPrice / 1000).toFixed(0)}K DA`,
      averageRating: favoriteTrips.length > 0 
        ? (favoriteTrips.reduce((sum, trip) => sum + trip.rating, 0) / favoriteTrips.length).toFixed(1)
        : '0.0'
    };
  };

  const stats = getTripStats();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Trips</Text>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('UserHome')}
        >
          <Text style={styles.exploreButtonText}>Explore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {favoriteTrips.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyStateTitle}>No Saved Trips Yet</Text>
            <Text style={styles.emptyStateText}>
              Start exploring amazing destinations and save your favorite trips for later!
            </Text>
            <TouchableOpacity 
              style={styles.exploreActionButton}
              onPress={() => navigation.navigate('UserHome')}
            >
              <Ionicons name="compass-outline" size={20} color="#ffffff" />
              <Text style={styles.exploreActionButtonText}>Discover Trips</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Saved Trips Content
          <>
            {/* Stats Overview */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Your Travel Wishlist</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalTrips}</Text>
                  <Text style={styles.statLabel}>Trips Saved</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.categories}</Text>
                  <Text style={styles.statLabel}>Categories</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.averageRating}</Text>
                  <Text style={styles.statLabel}>Avg Rating</Text>
                </View>
              </View>
            </View>

            {/* Saved Trips List */}
            <View style={styles.tripsSection}>
              <Text style={styles.sectionTitle}>
                {favoriteTrips.length} {favoriteTrips.length === 1 ? 'Saved Trip' : 'Saved Trips'}
              </Text>
              
              {favoriteTrips.map((trip) => (
                <TouchableOpacity 
                  key={trip.id} 
                  style={styles.tripCard}
                  onPress={() => handleViewTripDetails(trip)}
                >
                  <Image source={{ uri: trip.image }} style={styles.tripImage} />
                  
                  {/* Favorite Button */}
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => handleRemoveTrip(trip.id)}
                  >
                    <Ionicons name="heart" size={20} color="#ef4444" />
                  </TouchableOpacity>

                  {/* Category Badge */}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{trip.category}</Text>
                  </View>

                  {/* Rating Badge */}
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>{trip.rating}</Text>
                  </View>
                  
                  <View style={styles.tripInfo}>
                    <View style={styles.tripHeader}>
                      <Text style={styles.tripTitle} numberOfLines={2}>{trip.title}</Text>
                    </View>
                    
                    <View style={styles.tripLocation}>
                      <Ionicons name="location-outline" size={14} color="#6b7280" />
                      <Text style={styles.locationText}>{trip.location}</Text>
                    </View>
                    
                    <View style={styles.tripDetails}>
                      <Text style={styles.tripDuration}>{trip.duration}</Text>
                      <Text style={styles.tripAgency}>By {trip.agency}</Text>
                    </View>

                    <Text style={styles.tripDescription} numberOfLines={2}>
                      {trip.description}
                    </Text>
                    
                    <View style={styles.tripFooter}>
                      <Text style={styles.tripPrice}>{trip.price}</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.shareButton}
                          onPress={() => handleShareTrip(trip)}
                        >
                          <Ionicons name="share-outline" size={18} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.bookButton}
                          onPress={() => handleBookTrip(trip)}
                        >
                          <Text style={styles.bookButtonText}>Book Now</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => navigation.navigate('UserHome')}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#0ea5e9" />
                  <Text style={styles.quickActionText}>Add More Trips</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => navigation.navigate('AIAssistant')}
                >
                  <Ionicons name="sparkles-outline" size={24} color="#0ea5e9" />
                  <Text style={styles.quickActionText}>Get Recommendations</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    borderBottomWidth: 1,
    marginTop: 25,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f8fafc',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  exploreButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  exploreActionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  statsContainer: {
    backgroundColor: '#f0f9ff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
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
    textAlign: 'center',
  },
  tripsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  tripImage: {
    width: '100%',
    height: 200,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    position: 'absolute',
    top: 60,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  tripInfo: {
    padding: 16,
  },
  tripHeader: {
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 22,
  },
  tripLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripDuration: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  tripAgency: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  tripDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bookButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
});