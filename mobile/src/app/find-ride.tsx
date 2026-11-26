
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

export default function FindRideScreen() {
  const router = useRouter();

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState<
    'AUTO' | 'CAB' | undefined
  >(undefined);

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert(
        'Missing Details',
        'Please enter both pickup and destination.'
      );
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const result = await searchRides({
        pickup,
        destination,
        vehicleType,
      });

      setRides(result);
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

        <View style={styles.searchCard}>
          <Text style={styles.label}>Pickup Location</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            placeholderTextColor="#94A3B8"
            value={pickup}
            onChangeText={setPickup}
          />

          <Text style={styles.label}>Destination</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            placeholderTextColor="#94A3B8"
            value={destination}
            onChangeText={setDestination}
          />

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

          <TouchableOpacity
            style={styles.searchButton}
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
              rides.map((ride) => (
                <View key={ride.id} style={styles.rideCard}>
                  <View style={styles.rideHeader}>
                    <Text style={styles.vehicleType}>
                      {ride.vehicle.vehicleType}
                    </Text>

                    <Text style={styles.fare}>
                      ₹{ride.fare}
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
                </View>
              ))
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
});
