import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { 
  getMessages, 
  getDraft, 
  createMessage,
  markMessageAsSent,
  hardDeleteMessage,
  updateMessage,
  GetMessagesParams,
  getMessagePictureByMessageId
} from './apis';
import { MessagesResponse, DraftResponse, Message,MessagePicture } from './types';

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

// --- Messages Hooks ---

/**
 * Standard Query Hook for Messages
 * Use this for single page or non-infinite scrolling
 */
export const useGetMessages = (roomId: string, params?: GetMessagesParams) => {
  return useQuery<MessagesResponse, ApiError>({
    queryKey: ['messages', roomId, params?.limit, params?.offset],
    queryFn: () => getMessages(roomId, params),
    enabled: !!roomId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

// --- Draft Hooks ---

/**
 * Hook to get draft content for a room
 */
export const useGetDraft = (roomId: string) => {
  return useQuery<DraftResponse, ApiError>({
    queryKey: ['draft', roomId],
    queryFn: () => getDraft(roomId),
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};


// --- Create Message Hook ---

/**
 * Mutation hook to create a new message (text or media)
 */
export const useCreateMessage = (roomId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: Message }, ApiError, {
    content: string;
    room_type: string;
    parent_id?: string;
    file?: File | Blob;
  }>({
    mutationFn: (params) => createMessage(roomId, params),
    onSuccess: (data, variables) => {
      // Update infinite query cache
      queryClient.setQueryData<{ pages: MessagesResponse[]; pageParams: number[] }>(
        ['messagesInfinite', roomId],
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  messages: [data.message, ...page.messages],
                  total_count: page.total_count + 1,
                };
              }
              return page;
            }),
          };
        }
      );
      
      // Clear draft after sending
      queryClient.setQueryData<DraftResponse>(
        ['draft', roomId],
        { draft_content: ['', ''] }
      );
    },
  });
};

// --- Message Actions Hooks ---

/**
 * Mutation hook to mark a message as sent
 */
export const useMarkMessageAsSent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: Message }, ApiError, { messageId: string }>({
    mutationFn: ({ messageId }) => markMessageAsSent(messageId),
    onSuccess: (data, variables) => {
      // Update message status in cache
      queryClient.setQueriesData<{ pages: MessagesResponse[] }>(
        { queryKey: ['messagesInfinite'] },
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              messages: page.messages.map(msg => 
                msg.message_id === variables.messageId 
                  ? { ...msg, status: 'sent' }
                  : msg
              ),
            })),
          };
        }
      );
    },
  });
};

/**
 * Mutation hook to hard delete a message
 */
export const useHardDeleteMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string }, ApiError, { messageId: string }>({
    mutationFn: ({ messageId }) => hardDeleteMessage(messageId),
    onSuccess: (_, variables) => {
      // Remove message from cache
      queryClient.setQueriesData<{ pages: MessagesResponse[] }>(
        { queryKey: ['messagesInfinite'] },
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              messages: page.messages.filter(
                msg => msg.message_id !== variables.messageId
              ),
              total_count: page.total_count - 1,
            })),
          };
        }
      );
    },
  });
};

// --- Update Message Hook ---

/**
 * Mutation hook to update a message (text or media)
 */
export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: Message }, ApiError, {
    messageId: string;
    new_content: string;
    file?: File | Blob;
  }>({
    mutationFn: ({ messageId, new_content, file }) => 
      updateMessage(messageId, { new_content, file }),
    onSuccess: (data, variables) => {
      // Update message in cache
      queryClient.setQueriesData<{ pages: MessagesResponse[] }>(
        { queryKey: ['messagesInfinite'] },
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              messages: page.messages.map(msg => 
                msg.message_id === variables.messageId 
                  ? { ...msg, content: data.message.content, has_media: data.message.has_media }
                  : msg
              ),
            })),
          };
        }
      );
    },
  });
};
// --- Message Picture Hook ---

/**
 * Query hook to fetch the picture associated with a specific message.
 * Useful for lazy-loading media when a message has `has_media: true` but no URL.
 */
export const useGetMessagePicture = (messageId: string) => {
  return useQuery<MessagePicture, ApiError>({
    queryKey: ['messagePicture', messageId],
    queryFn: () => getMessagePictureByMessageId(messageId),
    enabled: !!messageId,
    staleTime: 1000 * 60 * 60, // 1 hour (media URLs don't change often)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  });
};