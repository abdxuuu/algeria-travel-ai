// src/screens/BookingsScreen.tsx (FIXED)
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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function BookingsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Mock bookings data with safe trip data
  const bookingsData = {
    upcoming: [
      {
        id: '1',
        trip: {
          id: 'trip-1',
          title: 'Djanet Desert Adventure',
          price: '89,000 DA',
          duration: '7 days',
          location: 'Djanet, Algeria',
          agency: 'Sahara Travels',
          rating: 4.8,
          category: 'Desert',
          images: [require('../assets/image1.jpg')]
        },
        agency: 'Sahara Travels',
        date: 'Mar 15 - Mar 22, 2024',
        price: '89,000 DA',
        status: 'confirmed',
        image: require('../assets/image1.jpg'),
        travelers: 2,
        bookingDate: 'Feb 10, 2024',
        bookingId: 'ALGTRV001',
        includes: ['Accommodation', 'Meals', 'Guided Tours', 'Transport'],
        contact: {
          name: 'Ahmed Bensalah',
          phone: '+213 123 456 789',
          email: 'ahmed@saharatravels.dz'
        }
      },
      {
        id: '2',
        trip: {
          id: 'trip-2',
          title: 'Bejaia Beach Paradise', 
          price: '62,000 DA',
          duration: '5 days',
          location: 'Bejaia, Algeria',
          agency: 'Coastal Tours',
          rating: 4.9,
          category: 'Beach',
          images: [require('../assets/image1.jpg')]
        },
        agency: 'Coastal Tours',
        date: 'Apr 5 - Apr 7, 2024',
        price: '62,000 DA',
        status: 'pending',
        image: require('../assets/image1.jpg'),
        travelers: 1,
        bookingDate: 'Feb 28, 2024',
        bookingId: 'ALGTRV002',
        includes: ['Resort Stay', 'Breakfast', 'Airport Transfer'],
        contact: {
          name: 'Fatima Zohra',
          phone: '+213 987 654 321', 
          email: 'fatima@coastaltours.dz'
        }
      }
    ],
    completed: [
      {
        id: '3',
        trip: {
          id: 'trip-3',
          title: 'Algiers City Break',
          price: '45,000 DA',
          duration: '3 days',
          location: 'Algiers, Algeria',
          agency: 'Urban Travels',
          rating: 4.6,
          category: 'City',
          images: [require('../assets/image1.jpg')]
        },
        agency: 'Urban Travels',
        date: 'Jan 20 - Jan 22, 2024',
        price: '45,000 DA',
        status: 'completed',
        image: require('../assets/image1.jpg'),
        travelers: 2,
        bookingDate: 'Jan 5, 2024',
        bookingId: 'ALGTRV003',
        includes: ['Hotel', 'City Tours', 'Museum Tickets'],
        rating: 4.5,
        review: 'Amazing experience! The guides were very knowledgeable.'
      }
    ],
    cancelled: [
      {
        id: '4',
        trip: {
          id: 'trip-4',
          title: 'Kabylie Mountain Escape',
          price: '70,000 DA',
          duration: '6 days',
          location: 'Tizi-Ouzou, Algeria',
          agency: 'Mountain Adventures',
          rating: 4.8,
          category: 'Mountain',
          images: [require('../assets/image1.jpg')]
        },
        agency: 'Mountain Adventures',
        date: 'Feb 14 - Feb 19, 2024',
        price: '70,000 DA',
        status: 'cancelled',
        image: require('../assets/image1.jpg'),
        travelers: 2,
        bookingDate: 'Jan 30, 2024',
        bookingId: 'ALGTRV004',
        cancelReason: 'Weather conditions'
      }
    ]
  };

  const tabs = [
    { key: 'upcoming', title: 'Upcoming', count: bookingsData.upcoming.length },
    { key: 'completed', title: 'Completed', count: bookingsData.completed.length },
    { key: 'cancelled', title: 'Cancelled', count: bookingsData.cancelled.length },
  ];

  const handleBookingPress = (booking: any) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDetailModalVisible(false);
      setSelectedBooking(null);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'completed': return '#17a2b8';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'completed': return 'checkmark-done';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // FIX: Safe trip title access
  const getTripTitle = (booking: any) => {
    return booking.trip?.title || booking.title || 'Unknown Trip';
  };

  // FIX: Safe price access
  const getTripPrice = (booking: any) => {
    return booking.trip?.price || booking.price || 'Price not available';
  };

  const renderBookingCard = (booking: any) => (
    <TouchableOpacity 
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => handleBookingPress(booking)}
    >
      <Image source={booking.image} style={styles.bookingImage} />
      
      <View style={styles.bookingInfo}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>{getTripTitle(booking)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Ionicons name={getStatusIcon(booking.status) as any} size={12} color="#fff" />
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{booking.agency}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{booking.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}</Text>
          </View>
        </View>
        
        <View style={styles.bookingFooter}>
          <Text style={styles.bookingPrice}>{getTripPrice(booking)}</Text>
          <Text style={styles.bookingId}>#{booking.bookingId}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const currentBookings = bookingsData[activeTab as keyof typeof bookingsData];

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
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color="#0066cc" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSummary}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{bookingsData.upcoming.length}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{bookingsData.completed.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{bookingsData.cancelled.length}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {bookingsData.upcoming.length + bookingsData.completed.length + bookingsData.cancelled.length}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
            <View style={[
              styles.tabCount,
              activeTab === tab.key && styles.activeTabCount
            ]}>
              <Text style={styles.tabCountText}>{tab.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bookingsList}
      >
        {currentBookings.length > 0 ? (
          currentBookings.map(renderBookingCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>
              {activeTab === 'upcoming' ? '✈️' : activeTab === 'completed' ? '🎉' : '📝'}
            </Text>
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'upcoming' ? 'No Upcoming Trips' : 
               activeTab === 'completed' ? 'No Completed Trips' : 'No Cancelled Trips'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'upcoming' ? 'Start planning your next adventure!' : 
               activeTab === 'completed' ? 'Your completed trips will appear here' : 
               'Cancelled trips will appear here'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('GuestHome')}
              >
                <Text style={styles.exploreButtonText}>Explore Trips</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { opacity: fadeAnim }
            ]}
          >
            {selectedBooking && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Booking Details</Text>
                  <TouchableOpacity onPress={handleCloseModal}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                  {/* Trip Image */}
                  <Image source={selectedBooking.image} style={styles.modalImage} />
                  
                  {/* Basic Info */}
                  <View style={styles.modalSection}>
                    {/* FIX: Safe trip title access */}
                    <Text style={styles.modalTripTitle}>{getTripTitle(selectedBooking)}</Text>
                    <View style={styles.modalStatusRow}>
                      <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedBooking.status) }]}>
                        <Ionicons name={getStatusIcon(selectedBooking.status) as any} size={14} color="#fff" />
                        <Text style={styles.modalStatusText}>{selectedBooking.status}</Text>
                      </View>
                      <Text style={styles.bookingId}>#{selectedBooking.bookingId}</Text>
                    </View>
                  </View>

                  {/* Booking Details */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Booking Information</Text>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <Ionicons name="business-outline" size={16} color="#666" />
                        <Text style={styles.detailLabel}>Agency</Text>
                        <Text style={styles.detailValue}>{selectedBooking.agency}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.detailLabel}>Travel Dates</Text>
                        <Text style={styles.detailValue}>{selectedBooking.date}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.detailLabel}>Travelers</Text>
                        <Text style={styles.detailValue}>{selectedBooking.travelers}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={16} color="#666" />
                        <Text style={styles.detailLabel}>Total Price</Text>
                        {/* FIX: Safe price access */}
                        <Text style={styles.detailValue}>{getTripPrice(selectedBooking)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Includes */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>What's Included</Text>
                    <View style={styles.includesList}>
                      {selectedBooking.includes.map((item: string, index: number) => (
                        <View key={index} style={styles.includeItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                          <Text style={styles.includeText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Contact Information */}
                  {selectedBooking.contact && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Agency Contact</Text>
                      <View style={styles.contactCard}>
                        <View style={styles.contactItem}>
                          <Ionicons name="person-outline" size={16} color="#666" />
                          <Text style={styles.contactText}>{selectedBooking.contact.name}</Text>
                        </View>
                        <View style={styles.contactItem}>
                          <Ionicons name="call-outline" size={16} color="#666" />
                          <Text style={styles.contactText}>{selectedBooking.contact.phone}</Text>
                        </View>
                        <View style={styles.contactItem}>
                          <Ionicons name="mail-outline" size={16} color="#666" />
                          <Text style={styles.contactText}>{selectedBooking.contact.email}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.secondaryButton}>
                      <Ionicons name="chatbubble-outline" size={18} color="#0066cc" />
                      <Text style={styles.secondaryButtonText}>Contact Agency</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryButton}>
                      <Ionicons name="download-outline" size={18} color="#fff" />
                      <Text style={styles.primaryButtonText}>Download Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
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
    paddingTop: 0, // 👈 ADD THIS LINE - moves header down
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 0, // 👈 ADD THIS LINE - moves header down
    color: '#1a1a1a',
  },
  filterButton: {
    padding: 5,
  },
  statsSummary: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0066cc',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  tabCount: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  activeTabCount: {
    backgroundColor: '#0066cc',
  },
  tabCountText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  bookingsList: {
    padding: 20,
    paddingBottom: 40,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  bookingImage: {
    width: 100,
    height: 120,
  },
  bookingInfo: {
    flex: 1,
    padding: 15,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 0, // 👈 ADD THIS LINE - moves header down
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookingDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  bookingId: {
    fontSize: 10,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // 👈 ADD THIS LINE - moves header down
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTripTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  includesList: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  includeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  contactCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#0066cc',
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#0066cc',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});