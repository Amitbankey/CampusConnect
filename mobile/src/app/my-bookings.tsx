
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
  getMyBookings,
  cancelBooking,
} from '../services/booking';

export default function MyBookingsScreen() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      setError('');
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load your bookings.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings(false);
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this ride booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(bookingId);

              await cancelBooking(bookingId);

              await loadBookings(false);

              Alert.alert('Success', 'Your booking has been cancelled.');
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Unable to cancel booking.'
              );
            } finally {
              setCancellingId(null);
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

  const statusColor = (status: Booking['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return styles.acceptedBadge;
      case 'REJECTED':
        return styles.rejectedBadge;
      case 'CANCELLED':
        return styles.cancelledBadge;
      default:
        return styles.pendingBadge;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>
          View and manage your ride bookings.
        </Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => loadBookings()}
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
          <View style={styles.summary}>
            <Text style={styles.summaryNumber}>{bookings.length}</Text>
            <Text style={styles.summaryLabel}>Total Bookings</Text>
          </View>

          {bookings.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No Bookings Yet</Text>
              <Text style={styles.emptyText}>
                Your booked rides will appear here.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/find-ride')}
              >
                <Text style={styles.buttonText}>Find a Ride</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bookings.map((booking) => {
              const driver = booking.ride?.driver?.user;
              const vehicle = booking.ride?.vehicle;

              const canCancel =
                booking.status === 'PENDING' ||
                booking.status === 'ACCEPTED';

              return (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Ride Booking</Text>

                    <View style={[styles.badge, statusColor(booking.status)]}>
                      <Text style={styles.badgeText}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

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

                    <Text style={styles.label}>Seats Booked</Text>
                    <Text style={styles.value}>
                      {booking.seatsBooked}
                    </Text>

                    <Text style={styles.label}>Fare per Seat</Text>
                    <Text style={styles.value}>
                      ₹{booking.ride.fare}
                    </Text>

                    <Text style={styles.label}>Driver</Text>
                    <Text style={styles.value}>
                      {driver?.name || 'Not available'}
                    </Text>

                    <Text style={styles.label}>Driver Phone</Text>
                    <Text style={styles.value}>
                      {driver?.phone || 'Not available'}
                    </Text>

                    <Text style={styles.label}>Vehicle</Text>
                    <Text style={styles.value}>
                      {vehicle
                        ? `${vehicle.vehicleType} - ${vehicle.vehicleNumber}`
                        : 'Not available'}
                    </Text>
                  </View>

                  {canCancel && (
                    <TouchableOpacity
                      style={[
                        styles.cancelButton,
                        cancellingId !== null && styles.disabledButton,
                      ]}
                      disabled={cancellingId !== null}
                      onPress={() => handleCancel(booking.id)}
                    >
                      {cancellingId === booking.id ? (
                        <ActivityIndicator color="#B91C1C" />
                      ) : (
                        <Text style={styles.cancelText}>
                          Cancel Booking
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
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
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#2563EB',
    marginRight: 12,
  },
  summaryLabel: {
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
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  acceptedBadge: {
    backgroundColor: '#DCFCE7',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  cancelledBadge: {
    backgroundColor: '#E5E7EB',
  },
  badgeText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
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
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 18,
  },
  cancelText: {
    color: '#B91C1C',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 25,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 15,
  },
});
