import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

type UserRole = 'STUDENT' | 'DRIVER';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    student?: unknown;
    driver?: unknown;
  };
}

export async function loginUser(
  email: string,
  password: string,
  selectedRole: UserRole
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const result: LoginResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed');
    }

    if (!result.token || !result.data) {
      throw new Error('Invalid server response');
    }

    if (result.data.role !== selectedRole) {
      throw new Error(
        `This account is registered as ${result.data.role.toLowerCase()}, not ${selectedRole.toLowerCase()}.`
      );
    }

    await SecureStore.setItemAsync('authToken', result.token);

    await SecureStore.setItemAsync(
      'userData',
      JSON.stringify(result.data)
    );

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to connect to CampusConnect server.');
  }
}
