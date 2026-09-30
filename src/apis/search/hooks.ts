// src/api/search/hooks.ts

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { globalSearch, smartUserSearch } from './apis';
import { GlobalSearchResponse, GlobalSearchParams, SmartUserSearchResponse,SmartUserSearchParams } from './types';

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

/**
 * Hook to execute a global search.
 * 
 * @param params - The search parameters (q and optional limit).
 * @param enabled - Whether the query should automatically run (useful for debouncing).
 */
export const useGlobalSearch = (
  params: GlobalSearchParams, 
  enabled: boolean = true
) => {
  return useQuery<GlobalSearchResponse, ApiError>({
    queryKey: ['globalSearch', params.q, params.limit],
    queryFn: () => globalSearch(params),
    
    // Only run the query if there is actually a search term
    enabled: enabled && !!params.q.trim(), 
    
    // Search results don't change every second, cache them for 2 minutes
    staleTime: 1000 * 60 * 2, 
    
    // Keep in memory for 5 minutes so navigating back to search is instant
    gcTime: 1000 * 60 * 5, 
    
    // Don't trigger a new search just because the user switched tabs and came back
    refetchOnWindowFocus: false, 
  });
};


export const useSmartUserSearch = (
  params: SmartUserSearchParams, 
  enabled: boolean = true
) => {
  return useQuery<SmartUserSearchResponse, ApiError>({
    queryKey: ['smartUserSearch', params.q], // Removed params.user_id
    queryFn: () => smartUserSearch(params),
    
    // Only run the query if there is actually a search term
    enabled: enabled && !!params.q.trim(), // Removed && !!params.user_id
    
    // Search results don't change every second, cache them for 2 minutes
    staleTime: 1000 * 60 * 2, 
    
    // Keep in memory for 5 minutes so navigating back to search is instant
    gcTime: 1000 * 60 * 5, 
    
    // Don't trigger a new search just because the user switched tabs and came back
    refetchOnWindowFocus: false, 
  });
};