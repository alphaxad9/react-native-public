// api.ts
import { AxiosError } from 'axios';

import { 
  CommentsResponse, 
  CreateCommentRequest, 
  CreateCommentResponse,
  EntityType 
} from './types';
import { client } from '../../client';

export const getCommentsByEntity = async (
  entityId: string,
  entityType: EntityType,
  limit: number = 20,
  offset: number = 0
): Promise<CommentsResponse> => {
  try {
    const response = await client.get<CommentsResponse>(
      `/comments/entity/${entityId}/`,
      {
        params: {
          entity_type: entityType,
          limit,
          offset,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch comments:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const createComment = async (
  payload: CreateCommentRequest
): Promise<CreateCommentResponse> => {
  try {
    const response = await client.post<CreateCommentResponse>(
      '/comments/create/',
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to create comment:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// Optional: helper for creating a reply (same endpoint, just adds parent_id)
export const createReply = async (
  parentId: string,
  entityId: string,
  entityType: EntityType,
  content: string
): Promise<CreateCommentResponse> => {
  return createComment({
    entity_id: entityId,
    entity_type: entityType,
    content,
    parent_id: parentId,
  });
};