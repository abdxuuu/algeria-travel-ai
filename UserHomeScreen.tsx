// src/screens/UserHomeScreen.tsx - COMPLETE WITH AGENCY PACKAGES
import React, { useState, useEffect } from 'react';
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
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, useFavorites, useTrips } from '../store/AppStore';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function UserHomeScreen({ navigation }: any) {
  const { user, isLoggedIn } = useAppStore();
  const { allTrips } = useTrips();
  const { favoriteTrips, toggleFavorite, isTripFavorite, loadFavoriteTrips } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('discover');
  const [refreshing, setRefreshing] = useState(false);
  const [agencyPackages, setAgencyPackages] = useState<any[]>([]);
  const [loadingAgencyPackages, setLoadingAgencyPackages] = useState(true);
  const [allAgencies, setAllAgencies] = useState<any[]>([]);

  const currentUser = user || {
    name: 'Guest User',
    email: 'guest@example.com',
    membership: 'Guest Member',
    joinDate: 'Just now',
    preferences: {
      budgetRange: 'medium',
      travelStyle: 'cultural',
      favoriteCategories: [],
      favoriteTrips: [],
    }
  };

  useEffect(() => {
    loadAllData();
  }, [isLoggedIn]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 UserHomeScreen focused - reloading data');
      loadAllData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAllData = async () => {
    await Promise.all([loadFavoriteTrips(), loadAgencyPackages(), loadAgencies()]);
  };

  const loadAgencyPackages = async () => {
    try {
      setLoadingAgencyPackages(true);
      console.log('📦 Loading agency packages from Firebase...');
      
      const packagesQuery = query(
        collection(db, 'packages'),
        where('available', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const packagesSnapshot = await getDocs(packagesQuery);
      const packages = packagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isAgencyPackage: true,
        source: 'agency'
      }));
      
      console.log(`✅ Loaded ${packages.length} agency packages`);
      setAgencyPackages(packages);
    } catch (error) {
      console.error('❌ Error loading agency packages:', error);
    } finally {
      setLoadingAgencyPackages(false);
    }
  };

  const loadAgencies = async () => {
    try {
      const agenciesSnapshot = await getDocs(collection(db, 'agencies'));
      const agencies = agenciesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllAgencies(agencies);
    } catch (error) {
      console.error('Error loading agencies:', error);
    }
  };

  const getAllTrips = () => {
    const combinedTrips = [...allTrips, ...agencyPackages];
    const uniqueTrips = combinedTrips.filter((trip, index, self) =>
      index === self.findIndex(t => t.id === trip.id)
    );
    return uniqueTrips;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const quickActions = [
    { 
      icon: '🤖', 
      title: 'AI Assistant', 
      screen: 'AIAssistant',
      color: '#0ea5e9',
      description: 'Plan with AI'
    },
    { 
      icon: '❤️', 
      title: 'Saved Trips', 
      screen: 'SavedTrips',
      color: '#ef4444',
      description: 'Your favorites'
    },
    { 
      icon: '🎯', 
      title: 'Preferences', 
      screen: 'TravelPreferences',
      color: '#10b981',
      description: 'Customize'
    },
    { 
      icon: '🏢', 
      title: 'Agencies', 
      screen: 'Agencies',
      color: '#8b5cf6',
      description: `View ${allAgencies.length}`
    },
  ];

  const categories = ['All', 'Beach', 'Mountain', 'City', 'Desert', 'Cultural', 'Agency'];

  const filteredTrips = getAllTrips().filter(trip => {
    const matchesSearch = trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.agency?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
                           (selectedCategory === 'Agency' ? trip.isAgencyPackage : trip.category === selectedCategory);
    
    const matchesTab = activeTab === 'discover' || (activeTab === 'favorites' && isTripFavorite(trip.id));
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleToggleFavorite = async (tripId: string) => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    try {
      await toggleFavorite(tripId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleTripPress = (trip: any) => {
    navigation.navigate('TripDetails', { 
      trip,
      isAgencyPackage: trip.isAgencyPackage 
    });
  };

  const handleBookPress = (trip: any) => {
    navigation.navigate('Booking', { 
      trip,
      isAgencyPackage: trip.isAgencyPackage 
    });
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const travelStyle = currentUser.preferences?.travelStyle;
    
    if (hour < 12) return 'Good morning! 🌅';
    if (hour < 18) return 'Good afternoon! ☀️';
    
    const styles = {
      adventure: 'Ready for an evening adventure? 🌄',
      cultural: 'Discover cultural experiences tonight! 🏛️',
      relaxation: 'Time to relax and unwind! 🌙',
      family: 'Plan your next family getaway! 👨‍👩‍👧‍👦',
      romantic: 'Find your perfect romantic escape! 💖'
    };
    return styles[travelStyle as keyof typeof styles] || 'Ready for your next trip? ✨';
  };

  const renderAgencyBadge = (trip: any) => {
    if (!trip.isAgencyPackage) return null;
    
    return (
      <View style={styles.agencyBadge}>
        <Ionicons name="business" size={10} color="#ffffff" />
        <Text style={styles.agencyBadgeText}>Agency</Text>
      </View>
    );
  };

  const renderTripCard = (trip: any) => {
    const isFavorited = isTripFavorite(trip.id);
    const isAgencyPackage = trip.isAgencyPackage;
    
    return (
      <TouchableOpacity 
        key={trip.id} 
        style={[
          styles.tripCard,
          isAgencyPackage && styles.agencyTripCard
        ]}
        onPress={() => handleTripPress(trip)}
      >
        <Image 
          source={{ uri: trip.image || trip.images?.[0] || 'https://via.placeholder.com/300x200' }} 
          style={styles.tripImage} 
        />
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(trip.id)}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorited ? "#ef4444" : "#ffffff"} 
          />
        </TouchableOpacity>

        {renderAgencyBadge(trip)}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {isAgencyPackage ? (trip.category || 'Agency') : trip.category}
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.ratingText}>{trip.rating || '4.5'}</Text>
        </View>
        
        <View style={styles.tripInfo}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle} numberOfLines={2}>
              {trip.title}
            </Text>
            <Text style={styles.tripPrice}>
              {trip.price || 'Contact for price'}
            </Text>
          </View>
          
          <View style={styles.tripLocation}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.locationText}>{trip.location}</Text>
          </View>
          
          <Text style={styles.tripDuration}>
            {trip.duration || 'Flexible'}
          </Text>
          
          <Text style={styles.tripDescription} numberOfLines={2}>
            {trip.description || 'Amazing travel experience awaits!'}
          </Text>
          
          <View style={styles.tripFooter}>
            <Text style={styles.tripAgency}>
              By {trip.agency || trip.agencyName || 'Algeria Travel'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.bookButton,
                isAgencyPackage && styles.agencyBookButton
              ]}
              onPress={() => handleBookPress(trip)}
            >
              <Text style={styles.bookButtonText}>
                {isAgencyPackage ? 'Inquire' : 'Book Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0ea5e9']}
            tintColor="#0ea5e9"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={styles.avatar}>
                {currentUser.photoURL ? (
                  <Image source={{ uri: currentUser.photoURL }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>
                {getPersonalizedGreeting()}
              </Text>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View style={styles.membershipBadge}>
                <Text style={styles.userMembership}>{currentUser.membership}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips, destinations, agencies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {agencyPackages.length > 0 && (
          <TouchableOpacity 
            style={styles.agencyInfoCard}
            onPress={() => setSelectedCategory('Agency')}
          >
            <View style={styles.agencyInfoContent}>
              <View style={styles.agencyInfoIcon}>
                <Ionicons name="business" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.agencyInfoText}>
                <Text style={styles.agencyInfoTitle}>
                  {agencyPackages.length} Agency Packages Available!
                </Text>
                <Text style={styles.agencyInfoSubtitle}>
                  Discover exclusive trips from {allAgencies.length} verified Algerian travel agencies
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => navigation.navigate('AIAssistant')}
        >
          <View style={styles.aiContent}>
            <View style={styles.aiIconContainer}>
              <Text style={styles.aiEmoji}>🤖</Text>
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>AI Travel Assistant</Text>
              <Text style={styles.aiSubtitle}>
                Get personalized recommendations including agency packages
              </Text>
            </View>
            <View style={styles.aiArrow}>
              <Ionicons name="chevron-forward" size={24} color="#0ea5e9" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={styles.actionHeader}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <View style={[styles.actionBadge, { backgroundColor: action.color }]}>
                    <Text style={styles.actionBadgeText}>{action.description}</Text>
                  </View>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'discover' ? 'Discover Trips' : `Your Favorites (${favoriteTrips.length})`}
            </Text>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
                onPress={() => setActiveTab('discover')}
              >
                <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
                  Discover
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                onPress={() => setActiveTab('favorites')}
              >
                <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
                  Favorites ({favoriteTrips.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingAgencyPackages && filteredTrips.length === 0 && (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={styles.loadingText}>Loading amazing trips...</Text>
            </View>
          )}

          {filteredTrips.length === 0 && !loadingAgencyPackages ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'favorites' ? 'No favorite trips yet' : 'No trips found'}
              </Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'favorites' 
                  ? 'Start exploring and save your favorite trips!'
                  : 'Try adjusting your search or filters'
                }
              </Text>
              {activeTab === 'favorites' && (
                <TouchableOpacity 
                  style={styles.exploreButton}
                  onPress={() => setActiveTab('discover')}
                >
                  <Text style={styles.exploreButtonText}>Explore Trips</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.tripsGrid}>
              {filteredTrips.map(renderTripCard)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  membershipBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  userMembership: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  agencyInfoCard: {
    backgroundColor: '#f8f7ff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  agencyInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agencyInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agencyInfoText: {
    flex: 1,
  },
  agencyInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  agencyInfoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  aiCard: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiEmoji: {
    fontSize: 24,
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  aiArrow: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    marginTop: 20,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tripsGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  agencyTripCard: {
    borderColor: '#8b5cf6',
    borderWidth: 1,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  agencyBadge: {
    position: 'absolute',
    top: 12,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  agencyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
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
  tripDuration: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
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
  tripAgency: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
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
  agencyBookButton: {
    backgroundColor: '#8b5cf6',
  },
  bookButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingState: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});