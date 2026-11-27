
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

export interface Booking {
  id: string;
  rideId: string;
  studentId: string;
  seatsBooked: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;

  student?: {
    user?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };

  ride: {
    id: string;
    pickup: string;
    destination: string;
    departureTime: string;
    fare: number;
    availableSeats?: number;
    vehicle?: {
      vehicleNumber: string;
      vehicleType: 'AUTO' | 'CAB';
    };
    driver?: {
      user: {
        name: string;
        phone: string;
      };
    };
  };
}

interface BookingResponse {
  success: boolean;
  message: string;
  count?: number;
  data: Booking | Booking[];
}

async function getAuthHeaders() {
  const token = await SecureStore.getItemAsync('authToken');

  if (!token) {
    throw new Error('Please login again.');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Create a booking (Student)
export async function createBooking(
  rideId: string,
  seatsBooked: number
): Promise<Booking> {
  if (!Number.isInteger(seatsBooked) || seatsBooked < 1 || seatsBooked > 7) {
    throw new Error('Please select a valid number of seats.');
  }

  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ rideId, seatsBooked }),
  });

  const result: BookingResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to book this ride.');
  }

  return result.data as Booking;
}

// Get student's bookings
export async function getMyBookings(): Promise<Booking[]> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/my-bookings`,
    {
      method: 'GET',
      headers,
    }
  );

  const result: BookingResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to fetch bookings.');
  }

  return Array.isArray(result.data) ? result.data : [];
}

// Cancel a booking (Student)
export async function cancelBooking(
  bookingId: string
): Promise<Booking> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
    {
      method: 'PATCH',
      headers,
    }
  );

  const result: BookingResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to cancel booking.');
  }

  return result.data as Booking;
}

// Get booking requests (Driver)
export async function getDriverBookingRequests(): Promise<Booking[]> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/driver/requests`,
    {
      method: 'GET',
      headers,
    }
  );

  const result: BookingResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to fetch ride requests.');
  }

  return Array.isArray(result.data) ? result.data : [];
}

// Accept a booking request (Driver)
export async function acceptBookingRequest(
  bookingId: string
): Promise<Booking> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/accept`,
    {
      method: 'PATCH',
      headers,
    }
  );

  const result: BookingResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to accept request.');
  }

  return result.data as Booking;
}

// Reject a booking request (Driver)
export async function rejectBookingRequest(
  bookingId: string
): Promise<Booking> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/reject`,
    {
      method: 'PATCH',
      headers,
    }
  );

  const result: BookingResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to reject request.');
  }

  return result.data as Booking;
}
