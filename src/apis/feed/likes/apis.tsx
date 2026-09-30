// apis.tsx
import { AxiosError } from 'axios';

import { 
  ToggleLikeRequest, 
  ToggleLikeResponse,
} from './types';
import { client } from '../../client';

export const toggleLike = async (
  payload: ToggleLikeRequest
): Promise<ToggleLikeResponse> => {
  try {
    const response = await client.post<ToggleLikeResponse>(
      '/likes/toggle/',
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to toggle like:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};