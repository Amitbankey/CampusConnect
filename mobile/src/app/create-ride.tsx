
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
import { createRide } from '../services/ride';

export default function CreateRideScreen() {
  const router = useRouter();

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [totalSeats, setTotalSeats] = useState('4');
  const [fare, setFare] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCreateRide = async () => {
    if (
      !pickup.trim() ||
      !destination.trim() ||
      !departureDate.trim() ||
      !departureTime.trim() ||
      !totalSeats.trim() ||
      !fare.trim()
    ) {
      Alert.alert('Missing Details', 'Please complete all fields.');
      return;
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      Alert.alert(
        'Invalid Locations',
        'Pickup and destination cannot be the same.'
      );
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
      Alert.alert('Invalid Date', 'Use date format YYYY-MM-DD.');
      return;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(departureTime)) {
      Alert.alert('Invalid Time', 'Use 24-hour time format HH:mm.');
      return;
    }

    const seats = Number(totalSeats);
    const rideFare = Number(fare);

    if (!Number.isInteger(seats) || seats < 1 || seats > 7) {
      Alert.alert('Invalid Seats', 'Total seats must be between 1 and 7.');
      return;
    }

    if (!Number.isFinite(rideFare) || rideFare <= 0) {
      Alert.alert('Invalid Fare', 'Enter a fare greater than zero.');
      return;
    }

    // Interpret the entered date and time as local device time,
    // then send an ISO timestamp to the backend.
    const localDeparture = new Date(
      `${departureDate}T${departureTime}:00`
    );

    if (
      Number.isNaN(localDeparture.getTime()) ||
      localDeparture.getFullYear() !== Number(departureDate.slice(0, 4)) ||
      localDeparture.getMonth() + 1 !== Number(departureDate.slice(5, 7)) ||
      localDeparture.getDate() !== Number(departureDate.slice(8, 10))
    ) {
      Alert.alert('Invalid Date', 'Please enter a valid calendar date.');
      return;
    }

    if (localDeparture <= new Date()) {
      Alert.alert(
        'Invalid Departure',
        'Departure date and time must be in the future.'
      );
      return;
    }

    setLoading(true);

    try {
      const ride = await createRide({
        pickup: pickup.trim(),
        destination: destination.trim(),
        departureTime: localDeparture.toISOString(),
        totalSeats: seats,
        fare: rideFare,
      });

      Alert.alert(
        'Ride Created Successfully!',
        `Your ride has been published.\n\nFrom: ${ride.pickup}\nTo: ${ride.destination}\nSeats: ${ride.totalSeats}\nFare per seat: ₹${ride.fare}\nVehicle: ${ride.vehicle.vehicleNumber}\nStatus: ${ride.status}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Ride Creation Failed',
        error instanceof Error
          ? error.message
          : 'Unable to create ride.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Create a Ride</Text>

        <Text style={styles.subtitle}>
          Publish your ride and help students travel safely.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Pickup Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: VIT Bhopal"
            placeholderTextColor="#94A3B8"
            value={pickup}
            onChangeText={setPickup}
          />

          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: Sehore"
            placeholderTextColor="#94A3B8"
            value={destination}
            onChangeText={setDestination}
          />

          <Text style={styles.label}>Departure Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={departureDate}
            onChangeText={setDepartureDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <Text style={styles.label}>Departure Time</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:mm (24-hour format)"
            placeholderTextColor="#94A3B8"
            value={departureTime}
            onChangeText={setDepartureTime}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          <Text style={styles.label}>Total Passenger Seats</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter seats (1 to 7)"
            placeholderTextColor="#94A3B8"
            value={totalSeats}
            onChangeText={setTotalSeats}
            keyboardType="number-pad"
            maxLength={1}
          />

          <Text style={styles.label}>Fare Per Seat (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 150"
            placeholderTextColor="#94A3B8"
            value={fare}
            onChangeText={setFare}
            keyboardType="decimal-pad"
          />

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              Note: Your registered vehicle will be assigned automatically
              based on its passenger capacity. Your driver account must be
              approved to publish a ride.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleCreateRide}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                Publish Ride
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  formCard: {
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
    marginTop: 14,
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
  noteCard: {
    backgroundColor: '#E7F2FF',
    padding: 13,
    borderRadius: 10,
    marginTop: 20,
  },
  noteText: {
    color: '#315477',
    fontSize: 12,
    lineHeight: 19,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#1769AA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
