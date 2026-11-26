
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

interface RideFilters {
  pickup?: string;
  destination?: string;
  vehicleType?: 'AUTO' | 'CAB';
}

export async function searchRides(
  filters: RideFilters
): Promise<Ride[]> {
  try {
    // Get saved authentication token
    const token = await SecureStore.getItemAsync('authToken');

    console.log('Token available:', !!token);

    if (!token) {
      throw new Error('Please login again to search rides.');
    }

    // Prepare search parameters
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

    console.log('Ride search URL:', url);

    // Send authenticated API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result: RideResponse = await response.json();

    console.log('Ride search status:', response.status);
    console.log('Ride search success:', result.success);
    console.log('Rides found:', result.data?.length ?? 0);

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        result.message || 'Session expired. Please login again.'
      );
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || 'Unable to search rides.'
      );
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
