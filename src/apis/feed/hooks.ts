// apis/feed/hooks.ts

import { useInfiniteQuery, useMutation, UseMutationResult, useQuery, UseQueryResult, InfiniteData } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getFeedByUserId, createPost, getCachedChunkByUserId, getCachedChunkByUserIdWithParams } from './apis';
import { FeedResponse, CreatePostRequest, CreatePostResponse, CachedChunkResponse, PostItem } from './types';

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

export const PAGE_SIZE = 4;
export const CHUNK_SIZE = 5;

// Existing hook...
export const useGetFeedByUserId = (userId: string, enabled = true) => {
  return useInfiniteQuery<FeedResponse, ApiError>({
    queryKey: ['feed', userId],
    
    queryFn: ({ pageParam = 0 }) =>
      getFeedByUserId(userId, {
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    
    initialPageParam: 0,
    
    enabled: !!userId && enabled,
    
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.pagination;
      
      if (!pagination?.has_more) {
        return undefined;
      }
      
      return allPages.length * PAGE_SIZE;
    },
    
    select: (data) => {
      return data;
    },
    
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

// Existing hook...
export const useCreatePost = (): UseMutationResult<
  CreatePostResponse,
  ApiError,
  CreatePostRequest,
  unknown
> => {
  return useMutation<CreatePostResponse, ApiError, CreatePostRequest>({
    mutationFn: createPost,
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

// Hook for cached-chunk endpoint (simple query)
export const useGetCachedChunk = (
  userId: string, 
  enabled = true
): UseQueryResult<CachedChunkResponse, ApiError> => {
  return useQuery<CachedChunkResponse, ApiError>({
    queryKey: ['cached-chunk', userId],
    
    queryFn: () => getCachedChunkByUserId(userId),
    
    enabled: !!userId && enabled,
    
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

// Hook for cached-chunk with custom params
export const useGetCachedChunkWithParams = (
  userId: string,
  params?: { chunk_size?: number; offset?: number },
  enabled = true
): UseQueryResult<CachedChunkResponse, ApiError> => {
  return useQuery<CachedChunkResponse, ApiError>({
    queryKey: ['cached-chunk', userId, params?.chunk_size, params?.offset],
    
    queryFn: () => getCachedChunkByUserIdWithParams(userId, params),
    
    enabled: !!userId && enabled,
    
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

// ✅ CORRECTED: Hook for infinite scrolling with cached-chunks
// In hooks.ts, update useInfiniteCachedChunks
// apis/feed/hooks.ts

// Update the function signature to accept 3 parameters
// apis/feed/hooks.ts

export const useInfiniteCachedChunks = (
  userId: string, 
  chunkSize = CHUNK_SIZE,
  enabled = true  // Make sure this parameter exists
) => {
  return useInfiniteQuery<CachedChunkResponse, ApiError, {
    pages: CachedChunkResponse[];
    pageParams: unknown[];
    allPosts: PostItem[];
    totalPostsLoaded: number;
    lastRemainingCandidates: number;
  }>({
    queryKey: ['cached-chunks-infinite', userId],
    
    queryFn: ({ pageParam = 0 }) =>
      getCachedChunkByUserIdWithParams(userId, {
        chunk_size: chunkSize,
        offset: pageParam as number,
      }),
    
    initialPageParam: 0,
    
    // ✅ This prevents fetching when enabled is false
    enabled: !!userId && enabled,
    
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.remaining_candidates <= 0) {
        return undefined;
      }
      
      const loadedChunks = allPages.length;
      const nextOffset = loadedChunks * chunkSize;
      
      if (nextOffset >= lastPage.remaining_candidates + (loadedChunks * chunkSize)) {
        return undefined;
      }
      
      return nextOffset;
    },
    
    select: (data: InfiniteData<CachedChunkResponse, unknown>) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      allPosts: data.pages.flatMap(page => page.posts),
      totalPostsLoaded: data.pages.reduce((sum, page) => sum + page.posts.length, 0),
      lastRemainingCandidates: data.pages[data.pages.length - 1]?.remaining_candidates ?? 0,
    }),
    
    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};