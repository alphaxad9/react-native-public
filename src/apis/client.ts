import axios from "axios";
import { Platform } from 'react-native';

// Determine the correct API base URL based on platform
const getApiBaseUrl = (): string => {
  // For web browser
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/';
  }
  
  // For Android emulator
  if (Platform.OS === 'android') {
    // Check if running on emulator
    const isEmulator = false; // You can add emulator detection logic
    if (isEmulator) {
      return 'http://10.0.2.2:8000/';
    }
  }
  
  // For physical device (iOS or Android)
  // Use your computer's IP address
  return 'http://192.168.0.6:8000/';
};

const API_BASE_URL = getApiBaseUrl();

// ── NEW: Determine the correct WS base URL based on platform ──────────────
const getWsBaseUrl = (): string => {
  // For web browser
  if (Platform.OS === 'web') {
    return 'ws://localhost:8000/';
  }
  
  // For Android emulator
  if (Platform.OS === 'android') {
    const isEmulator = false; // You can add emulator detection logic
    if (isEmulator) {
      return 'ws://10.0.2.2:8000/';
    }
  }
  
  // For physical device (iOS or Android)
  return 'ws://192.168.0.6:8000/';
};

export const WS_BASE_URL = getWsBaseUrl();

export const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000,
    withCredentials: true,
});

// Add request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
client.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ ${error.response.status} from ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshFailed = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: any;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(client(prom.config));
    }
  });
  failedQueue = [];
};

export const resetRefreshState = () => {
  refreshFailed = false;
  isRefreshing = false;
  failedQueue = [];
};

// Internal refresh function
const refreshToken = async (): Promise<void> => {
  try {
    console.log('🔄 Refreshing token...');
    await client.post('zedvye_one/users/refresh/');
    console.log('✅ Token refreshed successfully');
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    throw error;
  }
};

// Response interceptor for token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/refresh/')) {
      return Promise.reject(error);
    }

    if (refreshFailed) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshToken();
      processQueue(null);
      return client(originalRequest);
    } catch (refreshError) {
      refreshFailed = true;
      processQueue(refreshError as Error);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);