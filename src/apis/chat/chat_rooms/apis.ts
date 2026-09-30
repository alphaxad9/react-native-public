import { AxiosError } from 'axios';
import { client } from '../../client'; // Adjust path to your axios client
import { ChatRoomsResponse } from './types';

// Define the query parameters for pagination
export interface GetHomeRoomsParams {
  limit?: number;
  offset?: number;
}

export const getHomeRooms = async (params?: GetHomeRoomsParams): Promise<ChatRoomsResponse> => {
  try {
    // The client automatically handles cookies (withCredentials: true) 
    // and token refresh (interceptors) just like your curl -b cookies.txt
    const response = await client.get<ChatRoomsResponse>(
      'room_one/home/',
      { params } // Axios automatically serializes this to ?limit=X&offset=Y
    );
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch home rooms:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};