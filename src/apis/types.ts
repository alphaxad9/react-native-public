// Keep your existing types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
}

// Update LoginResponse to include user (it already does in your apis)
export interface LoginResponse {
  message: string;
  user: User;
  access?: string;  // Optional - might come from response body
  refresh?: string; // Optional - might come from response body
}

export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export type ProfileUpdateData = {
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
};

export type ProfileUpdateResponse = {
  message: string;
  user: User;
};

// JWT Token response from Django backend
export interface JWTAuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

// Login credentials for your Django backend
export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  identifier?: string;
}

// Registration data for Django backend
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

// Token refresh request/response
export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

// API Error response
export interface APIError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

// Authentication state for Redux
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}