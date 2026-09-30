// api.ts
import { AxiosError } from 'axios';

import { FeedResponse, CreatePostRequest, CreatePostResponse, FeedPaginationParams, CachedChunkResponse } from './types';
import { client } from '../client';
// Re-declare LoginResponse locally if needed for type inference

export const getFeedByUserId = async (
  userId: string,
  params?: FeedPaginationParams
): Promise<FeedResponse> => {
  try {
    const response = await client.get<FeedResponse>(
      `/user_interest_graph_feed/by-user/${userId}/`,
      {
        params: {
          limit: params?.limit ?? 4,
          offset: params?.offset ?? 0,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch feed:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};
export const createPost = async (payload: CreatePostRequest): Promise<CreatePostResponse> => {
  try {
    const response = await client.post<CreatePostResponse>(
      '/posts/create/',
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to create post:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// Add this to your existing api.ts file

export const getCachedChunkByUserId = async (
  userId: string
): Promise<CachedChunkResponse> => {
  try {
    const response = await client.get<CachedChunkResponse>(
      `/user_interest_graph_feed/by-user/${userId}/cached-chunk/`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch cached chunk:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// If you need pagination/offset support for the cached-chunk endpoint
export const getCachedChunkByUserIdWithParams = async (
  userId: string,
  params?: {
    chunk_size?: number;  // Optional: override default chunk size
    offset?: number;       // Optional: start from a specific offset
  }
): Promise<CachedChunkResponse> => {
  try {
    const response = await client.get<CachedChunkResponse>(
      `/user_interest_graph_feed/by-user/${userId}/cached-chunk/`,
      { params }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch cached chunk:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};