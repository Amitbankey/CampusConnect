
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ride, searchRides } from '../services/ride';
import { createBooking } from '../services/booking';

// Suggested locations
const LOCATION_SUGGESTIONS = [
  'VIT Bhopal',
  'Sehore',
  'Ashta',
  'Bhopal',
];

export default function FindRideScreen() {
  const router = useRouter();

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  const [showPickupSuggestions, setShowPickupSuggestions] =
    useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);

  const [vehicleType, setVehicleType] = useState<
    'AUTO' | 'CAB' | undefined
  >(undefined);

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [selectedSeats, setSelectedSeats] = useState<
    Record<string, number>
  >({});

  const [bookingRideId, setBookingRideId] = useState<string | null>(
    null
  );

  // Filter location suggestions based on typed text
  const getSuggestions = (value: string) => {
    return LOCATION_SUGGESTIONS.filter((location) =>
      location.toLowerCase().includes(value.trim().toLowerCase())
    );
  };

  // Search available rides
  const handleSearch = async () => {
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert(
        'Missing Details',
        'Please enter both pickup and destination.'
      );
      return;
    }

    setShowPickupSuggestions(false);
    setShowDestinationSuggestions(false);

    setLoading(true);
    setSearched(true);

    try {
      const result = await searchRides({
        pickup: pickup.trim(),
        destination: destination.trim(),
        vehicleType,
      });

      setRides(result);

      setSelectedSeats((previous) => {
        const updated = { ...previous };

        result.forEach((ride) => {
          const maxSeats = Math.min(7, ride.availableSeats);

          updated[ride.id] = Math.min(
            Math.max(updated[ride.id] || 1, 1),
            maxSeats
          );
        });

        return updated;
      });
    } catch (error) {
      Alert.alert(
        'Search Failed',
        error instanceof Error
          ? error.message
          : 'Unable to search rides.'
      );

      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  // Change selected seats
  const changeSeats = (ride: Ride, change: number) => {
    const maxSeats = Math.min(7, ride.availableSeats);

    setSelectedSeats((previous) => {
      const currentSeats = previous[ride.id] || 1;

      const newSeats = Math.min(
        Math.max(currentSeats + change, 1),
        maxSeats
      );

      return {
        ...previous,
        [ride.id]: newSeats,
      };
    });
  };

  // Submit booking after confirmation
  const confirmBooking = async (ride: Ride) => {
    const seats = selectedSeats[ride.id] || 1;

    setBookingRideId(ride.id);

    try {
      const booking = await createBooking(ride.id, seats);

      Alert.alert(
        'Booking Submitted!',
        `Your booking has been submitted successfully.\n\nSeats booked: ${booking.seatsBooked}\nTotal fare: ₹${ride.fare * seats}\nStatus: PENDING\n\nYour seats are reserved while waiting for driver approval.`,
        [
          {
            text: 'OK',
            onPress: () => {
              handleSearch();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Booking Failed',
        error instanceof Error
          ? error.message
          : 'Unable to book this ride.'
      );
    } finally {
      setBookingRideId(null);
    }
  };

  // Show booking confirmation
  const handleBooking = (ride: Ride) => {
    const seats = selectedSeats[ride.id] || 1;
    const totalFare = ride.fare * seats;

    Alert.alert(
      'Confirm Booking',
      `Pickup: ${ride.pickup}\nDestination: ${ride.destination}\nSeats: ${seats}\nTotal Fare: ₹${totalFare}\n\nDo you want to confirm this booking?`,
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Confirm Booking',
          onPress: () => confirmBooking(ride),
        },
      ]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Find a Ride</Text>

        <Text style={styles.subtitle}>
          Find available rides from your campus community.
        </Text>

        {/* Search Form */}
        <View style={styles.searchCard}>
          {/* Pickup Location */}
          <Text style={styles.label}>Pickup Location</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            placeholderTextColor="#94A3B8"
            value={pickup}
            onFocus={() => {
              setShowPickupSuggestions(true);
              setShowDestinationSuggestions(false);
            }}
            onChangeText={(text) => {
              setPickup(text);
              setShowPickupSuggestions(true);
            }}
          />

          {showPickupSuggestions && (
            <View style={styles.suggestionList}>
              {getSuggestions(pickup).length > 0 ? (
                getSuggestions(pickup).map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setPickup(location);
                      setShowPickupSuggestions(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSuggestionText}>
                  No matching suggestions. You can enter your own location.
                </Text>
              )}
            </View>
          )}

          {/* Destination */}
          <Text style={styles.label}>Destination</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            placeholderTextColor="#94A3B8"
            value={destination}
            onFocus={() => {
              setShowDestinationSuggestions(true);
              setShowPickupSuggestions(false);
            }}
            onChangeText={(text) => {
              setDestination(text);
              setShowDestinationSuggestions(true);
            }}
          />

          {showDestinationSuggestions && (
            <View style={styles.suggestionList}>
              {getSuggestions(destination).length > 0 ? (
                getSuggestions(destination).map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setDestination(location);
                      setShowDestinationSuggestions(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSuggestionText}>
                  No matching suggestions. You can enter your own location.
                </Text>
              )}
            </View>
          )}

          {/* Vehicle Type */}
          <Text style={styles.label}>Vehicle Type</Text>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                vehicleType === undefined && styles.selectedFilter,
              ]}
              onPress={() => setVehicleType(undefined)}
            >
              <Text
                style={[
                  styles.filterText,
                  vehicleType === undefined && styles.selectedFilterText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                vehicleType === 'AUTO' && styles.selectedFilter,
              ]}
              onPress={() => setVehicleType('AUTO')}
            >
              <Text
                style={[
                  styles.filterText,
                  vehicleType === 'AUTO' && styles.selectedFilterText,
                ]}
              >
                AUTO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                vehicleType === 'CAB' && styles.selectedFilter,
              ]}
              onPress={() => setVehicleType('CAB')}
            >
              <Text
                style={[
                  styles.filterText,
                  vehicleType === 'CAB' && styles.selectedFilterText,
                ]}
              >
                CAB
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>
                Search Rides
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searched && !loading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeading}>
              Search Results ({rides.length})
            </Text>

            {rides.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No Rides Found
                </Text>

                <Text style={styles.emptyText}>
                  Try different pickup or destination locations.
                </Text>
              </View>
            ) : (
              rides.map((ride) => {
                const seats = selectedSeats[ride.id] || 1;
                const isBooking = bookingRideId === ride.id;
                const totalFare = ride.fare * seats;

                return (
                  <View key={ride.id} style={styles.rideCard}>
                    <View style={styles.rideHeader}>
                      <Text style={styles.vehicleType}>
                        {ride.vehicle.vehicleType}
                      </Text>

                      <Text style={styles.fare}>
                        ₹{ride.fare} / seat
                      </Text>
                    </View>

                    <Text style={styles.location}>
                      {ride.pickup}
                    </Text>

                    <Text style={styles.arrow}>↓</Text>

                    <Text style={styles.location}>
                      {ride.destination}
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.detail}>
                      Driver: {ride.driver.user.name}
                    </Text>

                    <Text style={styles.detail}>
                      Vehicle: {ride.vehicle.vehicleNumber}
                    </Text>

                    <Text style={styles.detail}>
                      Departure: {formatDate(ride.departureTime)}
                    </Text>

                    <Text style={styles.detail}>
                      Available seats: {ride.availableSeats}
                    </Text>

                    <View style={styles.divider} />

                    {/* Seat Selection */}
                    <Text style={styles.seatLabel}>
                      Select Number of Seats
                    </Text>

                    <View style={styles.seatContainer}>
                      <TouchableOpacity
                        style={[
                          styles.seatButton,
                          seats <= 1 && styles.disabledSeatButton,
                        ]}
                        onPress={() => changeSeats(ride, -1)}
                        disabled={seats <= 1 || isBooking}
                      >
                        <Text style={styles.seatButtonText}>−</Text>
                      </TouchableOpacity>

                      <Text style={styles.seatCount}>
                        {seats}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.seatButton,
                          seats >= Math.min(7, ride.availableSeats) &&
                            styles.disabledSeatButton,
                        ]}
                        onPress={() => changeSeats(ride, 1)}
                        disabled={
                          seats >= Math.min(7, ride.availableSeats) ||
                          isBooking
                        }
                      >
                        <Text style={styles.seatButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Total Fare */}
                    <View style={styles.totalFareContainer}>
                      <Text style={styles.totalFareLabel}>
                        Total Fare
                      </Text>

                      <Text style={styles.totalFare}>
                        ₹{totalFare}
                      </Text>
                    </View>

                    {/* Book Ride */}
                    <TouchableOpacity
                      style={[
                        styles.bookButton,
                        isBooking && styles.disabledButton,
                      ]}
                      onPress={() => handleBooking(ride)}
                      disabled={isBooking || ride.availableSeats < 1}
                    >
                      {isBooking ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.bookButtonText}>
                          Book Ride
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#102B50',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 7,
    marginBottom: 22,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 9,
    marginTop: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 14,
    color: '#102B50',
  },
  suggestionList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#102B50',
  },
  noSuggestionText: {
    fontSize: 13,
    color: '#64748B',
    padding: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: '#E7F2FF',
    borderColor: '#1769AA',
  },
  filterText: {
    color: '#64748B',
    fontWeight: '600',
  },
  selectedFilterText: {
    color: '#1769AA',
  },
  searchButton: {
    height: 50,
    backgroundColor: '#1769AA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  resultsContainer: {
    marginTop: 25,
  },
  resultsHeading: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#102B50',
    marginBottom: 15,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#102B50',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 7,
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  vehicleType: {
    color: '#1769AA',
    fontWeight: 'bold',
    fontSize: 15,
  },
  fare: {
    color: '#15803D',
    fontWeight: 'bold',
    fontSize: 18,
  },
  location: {
    color: '#102B50',
    fontSize: 15,
    fontWeight: '600',
  },
  arrow: {
    color: '#1769AA',
    fontSize: 18,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  detail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 7,
  },
  seatLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  seatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 25,
  },
  seatButton: {
    width: 40,
    height: 40,
    backgroundColor: '#E7F2FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1769AA',
  },
  disabledSeatButton: {
    opacity: 0.35,
  },
  seatButtonText: {
    fontSize: 24,
    color: '#1769AA',
    fontWeight: 'bold',
  },
  seatCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#102B50',
  },
  totalFareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 15,
  },
  totalFareLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  totalFare: {
    fontSize: 21,
    color: '#15803D',
    fontWeight: 'bold',
  },
  bookButton: {
    height: 48,
    backgroundColor: '#1769AA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
