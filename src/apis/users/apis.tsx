// api.ts
import { AxiosError } from 'axios';

import {
  UserItem,
  UserDetailResponse,
  UserListResponse,
  FriendsResponse,
  FollowersResponse,
  DiscoverResponse,
  LoginResponse,
  UserQueryParams,
} from './types';
import { client } from '../client';

// ============================
// User Query Endpoints
// ============================

export const getUserByUuid = async (uuid: string): Promise<UserDetailResponse> => {
  try {
    const response = await client.get<UserDetailResponse>(
      `/user_queries/${uuid}/`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch user by UUID:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const getUserByUsername = async (username: string): Promise<UserDetailResponse> => {
  try {
    const response = await client.get<UserDetailResponse>(
      `/user_queries/username/${username}/`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch user by username:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const getUsersList = async (params?: UserQueryParams): Promise<UserListResponse> => {
  try {
    const response = await client.get<UserListResponse>(
      '/user_queries/',
      { params }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch users list:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const getFriendsList = async (params?: { limit?: number; offset?: number }): Promise<FriendsResponse> => {
  try {
    const response = await client.get<FriendsResponse>(
      '/user_queries/friends/',
      { params }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch friends list:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const getFollowersList = async (params?: { limit?: number; offset?: number }): Promise<FollowersResponse> => {
  try {
    const response = await client.get<FollowersResponse>(
      '/user_queries/followers/',
      { params }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch followers list:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const getDiscoverUsers = async (params?: {
  limit?: number;
  offset?: number;
  include_followers?: boolean;
}): Promise<DiscoverResponse> => {
  try {
    const response = await client.get<DiscoverResponse>(
      '/user_queries/discover/',
      { params }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch discover users:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// ============================
// Auth Endpoint (for reference)
// ============================

export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await client.post<LoginResponse>(
      '/users/login/',
      credentials
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Login failed:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// ============================
// Helper: Extract user from response
// ============================

export const extractUser = (response: UserDetailResponse): UserItem => response.user;
export const extractUsers = (response: UserListResponse | DiscoverResponse): UserItem[] => response.users;
export const extractFriends = (response: FriendsResponse): UserItem[] => response.friends;
export const extractFollowers = (response: FollowersResponse): UserItem[] => response.followers;