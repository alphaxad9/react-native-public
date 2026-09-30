import { AxiosError } from 'axios';
import { LoginFormData, RegisterFormData, User, ProfileUpdateData, ProfileUpdateResponse } from './types';
import { client } from './client';

type LoginResponse = {
  message: string;
  user: User;
  access?: string;  // Optional - might come from response body
  refresh?: string; // Optional - might come from response body
};

export const register = async (data: RegisterFormData): Promise<User> => {
  try {
    const response = await client.post<User>(
      'zedvye_one/users/register/',
      data
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Registration failed:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const login = async (
  data: LoginFormData
): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>(
    'zedvye_one/users/login/',
    data
  );

  // No storage needed - cookies are automatically handled by the browser/client
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await client.post('zedvye_one/users/logout/', {});
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Logout failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// Check auth endpoint
export const checkAuth = async (): Promise<User> => {
  const response = await client.get<{ user: User }>('zedvye_one/users/check-auth/');
  return response.data.user;
};

export const updateProfile = async (data: ProfileUpdateData): Promise<ProfileUpdateResponse> => {
  try {
    // Use PATCH for partial updates
    const response = await client.patch<ProfileUpdateResponse>(
      'zedvye_one/users/profile/',
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Profile update failed:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};