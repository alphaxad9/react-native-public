import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getHomeRooms, GetHomeRoomsParams } from './apis';
import { ChatRoomsResponse } from './types';

// Optional: Import Redux if you want to restrict fetching to authenticated users only
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store';

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;


/**
 * Infinite Query Hook (Recommended for Chat UIs)
 * Best for implementing infinite scrolling/pagination in your UI.
 */
export const useGetHomeRoomsInfinite = (limit: number = 50) => {
  return useInfiniteQuery<ChatRoomsResponse, ApiError>({
    queryKey: ['homeRoomsInfinite', limit],
    queryFn: ({ pageParam }) => 
      getHomeRooms({ limit, offset: pageParam as number }),
    initialPageParam: 0, // Required in React Query v5
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // If backend says no more data, return undefined to stop pagination
      if (!lastPage.has_more) return undefined;
      
      // Calculate the next offset based on how many rooms we've fetched so far
      return (lastPageParam as number) + lastPage.rooms.length;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};