import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../apis/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  isLoggedOut: boolean;   // NEW: true only after confirmed logout, not on cold boot
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,   // Start true so ProtectedRoute waits
  isLoggedOut: false,     // Start false so useCheckAuth runs on boot
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isCheckingAuth = false;
      state.isLoggedOut = false;    // Allow future auth checks
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isCheckingAuth = false;
      state.isLoggedOut = true;     // KEY: disables useCheckAuth query
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isCheckingAuth = false;
      state.isLoggedOut = false;
      state.error = null;
    },
    setAuthCheckComplete: (state) => {
      state.isCheckingAuth = false;
      // NOTE: do NOT set isLoggedOut here — user may just not have a session
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setUser,
  setAuthCheckComplete,
} = authSlice.actions;

export default authSlice.reducer;