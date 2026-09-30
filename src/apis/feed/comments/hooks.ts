import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { 
  getCommentsByEntity, 
  createComment,
} from './apis';
import { CreateCommentResponse, CreateCommentRequest } from './types';
import { CommentsResponse, EntityType } from './types';

type CommentMutationContext = {
  previousComments?: CommentsResponse;
};

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

/**
 * Hook to fetch comments for a specific entity (post, article, etc.)
 * @param entityId - The ID of the entity to fetch comments for
 * @param entityType - The type of entity ('post', 'article', etc.)
 * @param limit - Number of comments to fetch per page (default: 20)
 * @param offset - Pagination offset (default: 0)
 * @param enabled - Whether the query should automatically run (default: true)
 */
export const useGetCommentsByEntity = (
  entityId: string,
  entityType: EntityType,
  limit: number = 20,
  offset: number = 0,
  enabled = true
) => {
  return useQuery<CommentsResponse, ApiError>({
    queryKey: ['comments', entityId, entityType, limit, offset],
    queryFn: () => getCommentsByEntity(entityId, entityType, limit, offset),
    enabled: !!entityId && !!entityType && enabled,
    staleTime: 30 * 1000, // 30 seconds - comments can be slightly stale
    gcTime: 2 * 60 * 1000, // 2 minutes cache retention
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Only retry on network errors or 5xx, not on 4xx
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};

/**
 * Hook to create a new comment or reply
 * @param onSuccess - Optional callback to run after successful creation
 * @param onMutate - Optional callback to run before mutation (for optimistic updates)
 */
export const useCreateComment = (
  onSuccess?: (data: CreateCommentResponse) => void,
  onMutate?: (variables: CreateCommentRequest) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<CreateCommentResponse, ApiError, CreateCommentRequest, CommentMutationContext>({
    mutationFn: (payload) => createComment(payload),
    
    onMutate: async (variables) => {
      onMutate?.(variables);

      await queryClient.cancelQueries({
        queryKey: ['comments', variables.entity_id, variables.entity_type],
      });

      const previousComments = queryClient.getQueryData<CommentsResponse>([
        'comments',
        variables.entity_id,
        variables.entity_type,
      ]);

      if (previousComments) {
        queryClient.setQueryData<CommentsResponse>(
          ['comments', variables.entity_id, variables.entity_type],
          {
            ...previousComments,
            count: previousComments.count + 1,
            comments: [
              {
                comment_id: `optimistic-${Date.now()}`,
                creator_id: '',
                entity_id: variables.entity_id,
                entity_type: variables.entity_type,
                content: variables.content,
                parent_id: variables.parent_id ?? null,
                number_of_replies: 0,
                number_of_likes: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_deleted: false,
                is_valid: true,
                is_reply: !!variables.parent_id,
              },
              ...previousComments.comments,
            ],
          }
        );
      }

      return { previousComments };
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.entity_id, variables.entity_type],
      });
      onSuccess?.(data);
    },

    onError: (error, variables, context?: CommentMutationContext) => {
      // Rollback to previous comments if mutation fails
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['comments', variables.entity_id, variables.entity_type],
          context.previousComments
        );
      }
      console.error('Failed to create comment:', error.message);
    },

    retry: (failureCount, error) => {
      const status = (error as ApiError).response?.status;
      return failureCount < 2 && (!status || status >= 500);
    },
  });
};