// hooks/useLikes.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { toggleLike } from './apis';
import { ToggleLikeRequest, ToggleLikeResponse, EntityType } from './types';

type LikeMutationContext = {
  previousIsLiked?: boolean;
  entityId: string;
  entityType: EntityType;
};

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

/**
 * Hook to toggle like status for an entity (post, article, video, image)
 * POST /likes/toggle/
 * 
 * @param entityId - The ID of the entity to toggle like for
 * @param entityType - The type of entity ('post', 'article', 'video', 'image')
 * @param onSuccess - Optional callback to run after successful toggle
 * @param onMutate - Optional callback for optimistic UI updates
 */
export const useToggleLike = (
  entityId: string,
  entityType: EntityType,
  onSuccess?: (data: ToggleLikeResponse) => void,
  onMutate?: (variables: ToggleLikeRequest, context: LikeMutationContext) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleLikeResponse,
    ApiError,
    ToggleLikeRequest,
    LikeMutationContext
  >({
    mutationFn: (payload) => toggleLike(payload),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ['like', variables.entity_id, variables.entity_type],
      });

      const previousIsLiked = queryClient.getQueryData<ToggleLikeResponse>([
        'like',
        variables.entity_id,
        variables.entity_type,
      ])?.is_liked;

      // Optimistic update: flip the like state immediately
      queryClient.setQueryData<ToggleLikeResponse>(
        ['like', variables.entity_id, variables.entity_type],
        {
          entity_id: variables.entity_id,
          entity_type: variables.entity_type,
          is_liked: !previousIsLiked,
        }
      );

      const context: LikeMutationContext = {
        previousIsLiked,
        entityId: variables.entity_id,
        entityType: variables.entity_type,
      };

      onMutate?.(variables, context);

      return context;
    },

    onSuccess: (data, variables) => {
      // Ensure cache matches server response
      queryClient.setQueryData<ToggleLikeResponse>(
        ['like', variables.entity_id, variables.entity_type],
        data
      );
      onSuccess?.(data);
    },

    onError: (error, variables, context?: LikeMutationContext) => {
      // Rollback optimistic update on error
      if (context?.previousIsLiked !== undefined) {
        queryClient.setQueryData<ToggleLikeResponse>(
          ['like', context.entityId, context.entityType],
          {
            entity_id: context.entityId,
            entity_type: context.entityType,
            is_liked: context.previousIsLiked,
          }
        );
      }
      console.error('Failed to toggle like:', error.message);
    },

    retry: (failureCount, error) => {
      // Only retry on network errors or 5xx server errors
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

