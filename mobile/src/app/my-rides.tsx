
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ride, getMyRides } from '../services/ride';

export default function MyRidesScreen() {
  const router = useRouter();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadRides = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const result = await getMyRides();
      setRides(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load rides.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, [])
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return styles.availableStatus;
      case 'FULL':
        return styles.fullStatus;
      case 'COMPLETED':
        return styles.completedStatus;
      case 'CANCELLED':
        return styles.cancelledStatus;
      default:
        return styles.defaultStatus;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRides(true)}
          />
        }
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>My Rides</Text>
        <Text style={styles.subtitle}>
          Manage the rides you have published.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1769AA"
            style={styles.loader}
          />
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Unable to Load Rides</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadRides()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : rides.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Rides Yet</Text>
            <Text style={styles.emptyText}>
              You haven't published any rides yet.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-ride')}
            >
              <Text style={styles.createButtonText}>Create a Ride</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>
              Your Published Rides ({rides.length})
            </Text>

            {rides.map((ride) => (
              <View key={ride.id} style={styles.rideCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.vehicleType}>
                    {ride.vehicle.vehicleType}
                  </Text>

                  <View style={[
                    styles.statusBadge,
                    getStatusStyle(ride.status),
                  ]}>
                    <Text style={styles.statusText}>
                      {ride.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.location}>{ride.pickup}</Text>
                <Text style={styles.arrow}>↓</Text>
                <Text style={styles.location}>
                  {ride.destination}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.detail}>
                  Vehicle: {ride.vehicle.vehicleNumber}
                </Text>

                <Text style={styles.detail}>
                  Departure: {formatDate(ride.departureTime)}
                </Text>

                <Text style={styles.detail}>
                  Total seats: {ride.totalSeats}
                </Text>

                <Text style={styles.detail}>
                  Available seats: {ride.availableSeats}
                </Text>

                <View style={styles.fareContainer}>
                  <Text style={styles.fareLabel}>Fare per seat</Text>
                  <Text style={styles.fare}>₹{ride.fare}</Text>
                </View>
              </View>
            ))}
          </>
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
  content: {
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
    color: '#64748B',
    fontSize: 14,
    marginTop: 7,
    marginBottom: 22,
  },
  loader: {
    marginTop: 60,
  },
  countText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#102B50',
    marginBottom: 15,
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1769AA',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  availableStatus: {
    backgroundColor: '#DCFCE7',
  },
  fullStatus: {
    backgroundColor: '#FEF3C7',
  },
  completedStatus: {
    backgroundColor: '#DBEAFE',
  },
  cancelledStatus: {
    backgroundColor: '#FEE2E2',
  },
  defaultStatus: {
    backgroundColor: '#E2E8F0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },
  location: {
    fontSize: 15,
    fontWeight: '600',
    color: '#102B50',
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
    marginTop: 8,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  fareLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  fare: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#15803D',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#102B50',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 9,
  },
  retryButton: {
    backgroundColor: '#1769AA',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 9,
    marginTop: 18,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#1769AA',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 9,
    marginTop: 18,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
