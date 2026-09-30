import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AxiosError } from 'axios';
import {
  register,
  login,
  logout,
  checkAuth,
  updateProfile
} from './apis';
import {
  LoginFormData,
  RegisterFormData,
  User,
  LoginResponse,
  ProfileUpdateResponse,
  ProfileUpdateData,
} from './types';
import { useAppDispatch } from '../hooks/typedHooks';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  setUser,
  setAuthCheckComplete,
} from '../store/authSlice';
import { resetRefreshState } from './client';

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

const getErrorMessage = (error: ApiError): string => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.response?.data?.detail ||
    error.message ||
    'An unexpected error occurred'
  );
};

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, RegisterFormData>({
    mutationFn: (data: RegisterFormData) => register(data),
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (user: User) => {
      resetRefreshState(); // Allow refresh attempts again after fresh registration
      dispatch(loginSuccess(user));
      // Invalidate and refetch auth status to ensure cookie state is synced
      queryClient.invalidateQueries({ queryKey: ['checkAuth'] });
    },
    onError: (error: ApiError) => {
      const message = getErrorMessage(error);
      dispatch(loginFailure(message));
      console.error('Registration failed:', message);
    },
  });
};

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginFormData>({
    mutationFn: (data: LoginFormData) => login(data),
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (response: LoginResponse) => {
      resetRefreshState(); // Allow refresh attempts again after fresh login
      dispatch(loginSuccess(response.user));
      // Invalidate and refetch auth status
      queryClient.invalidateQueries({ queryKey: ['checkAuth'] });
      // Also invalidate any user-specific queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: ApiError) => {
      const message = getErrorMessage(error);
      dispatch(loginFailure(message));
      console.error('Login failed:', message);
    },
  });
};
// In your hooks.ts file, update the useLogout hook:
// In your apis/hooks.ts file, update useLogout:
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      console.log('🔵 useLogout mutationFn - calling logout API');
      try {
        const result = await logout();
        console.log('🟢 Logout API success:', result);
        return result;
      } catch (error) {
        console.error('🔴 Logout API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🟢 Logout onSuccess - clearing all state');
      // Clear all auth state
      dispatch(logoutAction());
      // Reset refresh state
      resetRefreshState();
      // Clear all React Query cache
      queryClient.clear();
      queryClient.removeQueries();
      console.log('🟢 State cleared successfully');
    },
    onError: (error: ApiError) => {
      console.error('🔴 Logout onError:', getErrorMessage(error));
      // Even if API call fails, clear local state
      console.log('🟡 Clearing state despite API error');
      dispatch(logoutAction());
      resetRefreshState();
      queryClient.clear();
      queryClient.removeQueries();
    },
  });
};

export const useCheckAuth = () => {
  const dispatch = useAppDispatch();
  const isLoggedOut = useSelector((state: RootState) => state.auth.isLoggedOut);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const query = useQuery<User, ApiError>({
    queryKey: ['checkAuth'],
    queryFn: checkAuth,
    retry: false,                    // Never retry on 401
    staleTime: 5 * 60 * 1000,       // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000,         // Garbage collect after 10 minutes
    refetchOnWindowFocus: false,     // Don't re-trigger on window focus
    refetchOnMount: true,            // Check on mount (important for initial load)
    refetchOnReconnect: false,       // Don't refetch on network reconnect
    enabled: !isLoggedOut,           // Disable entirely after logout
  });

  // Successful auth
  useEffect(() => {
    if (query.data && !isAuthenticated) {
      console.log('User authenticated:', query.data.username);
      dispatch(setUser(query.data));
    }
  }, [query.data, dispatch, isAuthenticated]);

  // Auth failed (401 or other error)
  useEffect(() => {
    if (query.error && !isLoggedOut) {
      console.log('User not authenticated:', getErrorMessage(query.error));
      dispatch(logoutAction());
    }
  }, [query.error, dispatch, isLoggedOut]);

  // Auth check finished with no result (no cookie, no user)
  useEffect(() => {
    if (!query.isLoading && !query.isFetching && !query.data && !query.error && !isAuthenticated) {
      console.log('Auth check complete - no user found');
      dispatch(setAuthCheckComplete());
    }
  }, [query.isLoading, query.isFetching, query.data, query.error, dispatch, isAuthenticated]);

  return query;
};

export const useUpdateProfile = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<ProfileUpdateResponse, ApiError, ProfileUpdateData>({
    mutationFn: (data: ProfileUpdateData) => updateProfile(data),
    onSuccess: (response: ProfileUpdateResponse) => {
      // Update user in Redux store
      dispatch(setUser(response.user));
      
      // Update cached auth data
      queryClient.setQueryData(['checkAuth'], response.user);
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['checkAuth'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      console.log('Profile updated successfully');
    },
    onError: (error: ApiError) => {
      const errorMsg =
        error.response?.data?.errors?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to update profile.';
      console.error('Profile update failed:', errorMsg);
      throw error;
    },
  });
};

// Optional: Helper hook to get current authenticated user from cache
export const useCurrentUser = (): User | undefined => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<User>(['checkAuth']);
};

// Optional: Hook to check if user has specific role/permission
export const useHasRole = (requiredRole?: string): boolean => {
  const user = useCurrentUser();
  if (!requiredRole) return true;
  // Add your role checking logic here based on your User type
  // Example: return user?.role === requiredRole;
  return true;
};