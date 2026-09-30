import { AxiosError } from 'axios';
import { client } from '../../client';
import { MessagesResponse, DraftResponse, Message, MessagePicture } from './types';

// --- Messages API ---

export interface GetMessagesParams {
  limit?: number;
  offset?: number;
}

export const getMessages = async (
  roomId: string,
  params?: GetMessagesParams
): Promise<MessagesResponse> => {
  try {
    const response = await client.get<MessagesResponse>(
      `messages_one/${roomId}/messages/get/`,
      { params }
    );
    console.log(response.data.last_message)
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch messages:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// --- Draft API ---

export const getDraft = async (roomId: string): Promise<DraftResponse> => {
  try {
    const response = await client.get<DraftResponse>(
      `messages_one/${roomId}/messages/draft/`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch draft:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const saveDraft = async (roomId: string, content: string): Promise<void> => {
  try {
    await client.post(
      `messages_one/${roomId}/messages/draft/`,
      { content }
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to save draft:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// --- Create Message API (Unified - handles both text and media) ---

interface CreateMessageParams {
  content: string;
  room_type: string;
  parent_id?: string;
  file?: File | Blob;
}

export const createMessage = async (
  roomId: string,
  { content, room_type, parent_id, file }: CreateMessageParams
): Promise<{ message: Message }> => {
  try {
    let response;
    
    if (file) {
      // With media file
      const formData = new FormData();
      formData.append('content', content);
      formData.append('room_type', room_type);
      if (parent_id) {
        formData.append('parent_id', parent_id);
      }
      formData.append('file', file);
      
      response = await client.post<{ message: Message }>(
        `messages_one/${roomId}/messages/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } else {
      // Text only
      response = await client.post<{ message: Message }>(
        `messages_one/${roomId}/messages/`,
        { content, room_type, parent_id }
      );
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to create message:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// --- Message Actions API ---

export const markMessageAsSent = async (messageId: string): Promise<{ message: Message }> => {
  try {
    const response = await client.post<{ message: Message }>(
      `messages_one/messages/${messageId}/mark-as-sent/`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to mark message as sent:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

export const hardDeleteMessage = async (messageId: string): Promise<{ message: string }> => {
  try {
    const response = await client.post<{ message: string }>(
      `messages_one/messages/${messageId}/hard-delete/`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to delete message:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// --- Update Message API (Unified - handles text and media) ---

interface UpdateMessageParams {
  new_content: string;
  file?: File | Blob;
}

export const updateMessage = async (
  messageId: string,
  { new_content, file }: UpdateMessageParams
): Promise<{ message: Message }> => {
  try {
    let response;
    
    if (file) {
      // Update with media file
      const formData = new FormData();
      formData.append('new_content', new_content);
      formData.append('file', file);
      
      response = await client.patch<{ message: Message }>(
        `messages_one/messages/${messageId}/content/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } else {
      // Update text only (also removes media if file not provided)
      response = await client.patch<{ message: Message }>(
        `messages_one/messages/${messageId}/content/`,
        { new_content }
      );
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to update message:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};

// --- Message Picture API ---

export const getMessagePictureByMessageId = async (
  messageId: string
): Promise<MessagePicture> => {
  try {
    const response = await client.get<MessagePicture>(
      `messages_one/messages/${messageId}/picture/`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to fetch message picture:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};