// apis.user.hooks.ts
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  getUserByUuid,
  getUserByUsername,
  getUsersList,
  getFriendsList,
  getFollowersList,
  getDiscoverUsers,
} from './apis';
import {
  UserDetailResponse,
  UserListResponse,
  FriendsResponse,
  FollowersResponse,
  DiscoverResponse,
  UserQueryParams,
} from './types';

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

// ============================
// Single User Hooks
// ============================

/**
 * Hook to fetch a user by UUID with relationship context
 * @param uuid - The UUID of the user to fetch
 * @param enabled - Whether the query should automatically run (default: true)
 */
export const useGetUserByUuid = (uuid: string | undefined, enabled = true) => {
  return useQuery<UserDetailResponse, ApiError>({
    queryKey: ['user', 'by-uuid', uuid],
    queryFn: () => getUserByUuid(uuid!),
    enabled: !!uuid && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - user profiles don't change often
    gcTime: 10 * 60 * 1000,   // 10 minutes cache retention
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

/**
 * Hook to fetch a user by username with relationship context
 * @param username - The username of the user to fetch
 * @param enabled - Whether the query should automatically run (default: true)
 */
export const useGetUserByUsername = (username: string | undefined, enabled = true) => {
  return useQuery<UserDetailResponse, ApiError>({
    queryKey: ['user', 'by-username', username],
    queryFn: () => getUserByUsername(username!),
    enabled: !!username && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

// ============================
// List Hooks
// ============================

/**
 * Hook to fetch a paginated list of users
 * @param params - Query parameters: limit, offset, include_deleted, include_followers
 * @param enabled - Whether the query should automatically run (default: true)
 */
export const useGetUsersList = (params?: UserQueryParams, enabled = true) => {
  const key = ['users', 'list', params?.limit, params?.offset, params?.include_deleted, params?.include_followers].filter(Boolean);
  
  return useQuery<UserListResponse, ApiError>({
    queryKey: key,
    queryFn: () => getUsersList(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - user lists can change with follows/unfollows
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

/**
 * Hook to fetch the current user's friends list
 * @param params - Pagination parameters: limit, offset
 * @param enabled - Whether the query should automatically run (default: true)
 */
export const useGetFriendsList = (params?: { limit?: number; offset?: number }, enabled = true) => {
  const key = ['users', 'friends', params?.limit, params?.offset].filter(Boolean);
  
  return useQuery<FriendsResponse, ApiError>({
    queryKey: key,
    queryFn: () => getFriendsList(params),
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes - friendships change occasionally
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

/**
 * Hook to fetch the current user's followers list
 * @param params - Pagination parameters: limit, offset
 * @param enabled - Whether the query should automatically run (default: true)
 */
export const useGetFollowersList = (params?: { limit?: number; offset?: number }, enabled = true) => {
  const key = ['users', 'followers', params?.limit, params?.offset].filter(Boolean);
  
  return useQuery<FollowersResponse, ApiError>({
    queryKey: key,
    queryFn: () => getFollowersList(params),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

/**
 * Hook to fetch discover/users for exploration
 * @param params - Query parameters: limit, offset, include_followers
 * @param enabled - Whether the query should automatically run (default: true)
 */
export const useGetDiscoverUsers = (
  params?: { limit?: number; offset?: number; include_followers?: boolean },
  enabled = true
) => {
  const key = ['users', 'discover', params?.limit, params?.offset, params?.include_followers].filter(Boolean);
  
  return useQuery<DiscoverResponse, ApiError>({
    queryKey: key,
    queryFn: () => getDiscoverUsers(params),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute - discover feed should feel fresh
    gcTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

// ============================
// Utility Hook: Extract user from detail response
// ============================

/**
 * Helper hook to extract the UserItem from a UserDetailResponse query
 * Useful for cleaner component code when you only need the user object
 */
export const useUserFromDetail = (query: ReturnType<typeof useGetUserByUuid | typeof useGetUserByUsername>) => {
  return {
    ...query,
    data: query.data?.user,
  };
};