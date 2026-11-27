
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  Booking,
  getDriverBookingRequests,
  acceptBookingRequest,
  rejectBookingRequest,
} from '../services/booking';

export default function RideRequestsScreen() {
  const router = useRouter();

  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      setError('');

      const data = await getDriverBookingRequests();
      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load ride requests.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests(false);
  };

  const handleAccept = async (bookingId: string) => {
    try {
      setProcessingId(bookingId);

      await acceptBookingRequest(bookingId);

      setRequests((previous) =>
        previous.filter((item) => item.id !== bookingId)
      );

      Alert.alert('Success', 'Booking request accepted.');
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Unable to accept request.'
      );
      loadRequests(false);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (bookingId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(bookingId);

              await rejectBookingRequest(bookingId);

              setRequests((previous) =>
                previous.filter((item) => item.id !== bookingId)
              );

              Alert.alert('Success', 'Booking request rejected.');
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Unable to reject request.'
              );
              loadRequests(false);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading ride requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ride Requests</Text>
        <Text style={styles.subtitle}>
          Manage student booking requests.
        </Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadRequests()}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>{requests.length}</Text>
            <Text style={styles.countLabel}>Pending Requests</Text>
          </View>

          {requests.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No Pending Requests</Text>
              <Text style={styles.emptyText}>
                Student booking requests will appear here.
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => loadRequests()}
              >
                <Text style={styles.buttonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            requests.map((booking) => {
              const studentName =
                booking.student?.user?.name || 'Student';

              const studentPhone =
                booking.student?.user?.phone || 'Not provided';

              const vehicle = booking.ride?.vehicle;
              const isProcessing = processingId === booking.id;

              return (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.studentName}>
                      {studentName}
                    </Text>

                    <Text style={styles.pendingBadge}>PENDING</Text>
                  </View>

                  <Text style={styles.phone}>
                    Phone: {studentPhone}
                  </Text>

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>
                    Journey Details
                  </Text>

                  <Text style={styles.label}>Pickup</Text>
                  <Text style={styles.value}>
                    {booking.ride.pickup}
                  </Text>

                  <Text style={styles.label}>Destination</Text>
                  <Text style={styles.value}>
                    {booking.ride.destination}
                  </Text>

                  <View style={styles.details}>
                    <Text style={styles.label}>Departure</Text>
                    <Text style={styles.value}>
                      {formatDate(booking.ride.departureTime)}
                    </Text>

                    <Text style={styles.label}>Seats Requested</Text>
                    <Text style={styles.value}>
                      {booking.seatsBooked}
                    </Text>

                    <Text style={styles.label}>Fare per Seat</Text>
                    <Text style={styles.value}>
                      ₹{booking.ride.fare}
                    </Text>

                    <Text style={styles.label}>Vehicle</Text>
                    <Text style={styles.value}>
                      {vehicle
                        ? `${vehicle.vehicleType} - ${vehicle.vehicleNumber}`
                        : 'Not available'}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      disabled={processingId !== null}
                      onPress={() => handleReject(booking.id)}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      disabled={processingId !== null}
                      onPress={() => handleAccept(booking.id)}
                    >
                      {isProcessing ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.buttonText}>Accept</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 35,
  },
  countBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#2563EB',
    marginRight: 12,
  },
  countLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  pendingBadge: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: 'bold',
  },
  phone: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 7,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginTop: 3,
  },
  details: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  acceptButton: {
    backgroundColor: '#16A34A',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rejectText: {
    color: '#B91C1C',
    fontWeight: 'bold',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  refreshButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F7FC',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
});
