
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

export interface Ride {
  id: string;
  pickup: string;
  destination: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  fare: number;
  status: string;

  vehicle: {
    vehicleNumber: string;
    vehicleType: 'AUTO' | 'CAB';
    capacity: number;
  };

  driver: {
    user: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

interface RideResponse {
  success: boolean;
  count?: number;
  message?: string;
  data?: Ride[];
}

interface CreateRideResponse {
  success: boolean;
  message?: string;
  data?: Ride;
}

interface RideFilters {
  pickup?: string;
  destination?: string;
  vehicleType?: 'AUTO' | 'CAB';
}

export interface CreateRideInput {
  pickup: string;
  destination: string;
  departureTime: string;
  totalSeats: number;
  fare: number;
}

// Get authentication headers
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

// Search available rides
export async function searchRides(
  filters: RideFilters
): Promise<Ride[]> {
  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();

    if (filters.pickup?.trim()) {
      params.append('pickup', filters.pickup.trim());
    }

    if (filters.destination?.trim()) {
      params.append('destination', filters.destination.trim());
    }

    if (filters.vehicleType) {
      params.append('vehicleType', filters.vehicleType);
    }

    const query = params.toString();

    const url = `${API_BASE_URL}/api/rides${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const result: RideResponse = await response.json();

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        result.message || 'Session expired or access denied.'
      );
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to search rides.');
    }

    if (!Array.isArray(result.data)) {
      throw new Error('Invalid response received from server.');
    }

    return result.data;
  } catch (error) {
    console.error('Search rides error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to connect to CampusConnect server.');
  }
}

// Create a new ride
export async function createRide(
  rideDetails: CreateRideInput
): Promise<Ride> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/rides/create`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(rideDetails),
      }
    );

    const result: CreateRideResponse = await response.json();

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        result.message ||
          'You are not authorized to create a ride. Your driver account may need approval.'
      );
    }

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Unable to create ride.');
    }

    return result.data;
  } catch (error) {
    console.error('Create ride error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to connect to CampusConnect server.');
  }
}
// ==========================================
// GET RIDES CREATED BY LOGGED-IN DRIVER
// ==========================================

export async function getMyRides(): Promise<Ride[]> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/rides/my-rides`,
      {
        method: 'GET',
        headers,
      }
    );

    const result: RideResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to fetch your rides.');
    }

    if (!Array.isArray(result.data)) {
      throw new Error('Invalid rides response from server.');
    }

    return result.data;
  } catch (error) {
    console.error('Get my rides error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to connect to CampusConnect server.');
  }
}