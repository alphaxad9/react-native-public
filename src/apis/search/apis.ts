// src/api/search/apis.ts

import { AxiosError } from 'axios';
import { client } from '../client';
import { GlobalSearchResponse, GlobalSearchParams, SmartUserSearchResponse, SmartUserSearchParams } from './types';

/**
 * Execute a global search across all indices (users, tags, etc.)
 * Uses the backend's OpenSearch _msearch implementation.
 */
export const globalSearch = async (
  params: GlobalSearchParams
): Promise<GlobalSearchResponse> => {
  try {
    const response = await client.get<GlobalSearchResponse>(
      'open_search_apis/search/global/',
      { params } // Axios will automatically convert this to ?q=...&limit=...
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to execute global search:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};


export const smartUserSearch = async (
  params: SmartUserSearchParams
): Promise<SmartUserSearchResponse> => {
  try {
    const response = await client.get<SmartUserSearchResponse>(
      'open_search_apis/search/users/smart/',
      { params } // Axios will automatically convert this to ?q=...
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to execute smart user search:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};