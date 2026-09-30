// --- Message Types ---

// Message picture type from the API
export interface MessagePicture {
  picture_id: string;
  message_id: string;
  room_id: string;
  sender_id: string;
  url: string;
}

export interface Message {
  message_id: string;
  room_id: string;
  sender_id: string;
  room_type: string; // 'group' or 'private'
  content: string;
  has_media: boolean; // Changed from has_image to has_media
  parent_id: string | null; // For replies
  status: string; // 'draft', 'sent', 'delivered', 'read', 'pending'
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  sent_at: string | null;
  deleted_at: string | null;
  message_picture: MessagePicture | null; // Optional picture object
  // Frontend computed fields (not from API)
  creator_username?: string; // You'll need to map from sender_id
  is_mine?: boolean; // Computed based on current user
  has_image?: boolean; // Computed from has_media
  image_id?: string; // Computed from message_picture?.picture_id
}

export interface MessagesResponse {
  messages: Message[];
  total_count: number;
  has_more: boolean;
  last_message?: Message; 

}

// --- Request Types ---

// Create a new text-only message
export interface CreateTextMessageRequest {
  content: string;
  room_type: string; // 'group' or 'private'
  parent_id?: string; // Optional for replies
}

// Create a message with media
export interface CreateMediaMessageRequest extends CreateTextMessageRequest {
  file: File; // For multipart/form-data uploads
}

// Update message content (text only)
export interface UpdateMessageContentRequest {
  new_content: string;
}

// Update message content with media
export interface UpdateMessageWithMediaRequest extends UpdateMessageContentRequest {
  file: File | string;
}

// Mark message as sent
export interface MarkAsSentResponse {
  message: Message;
}

// Delete message response
export interface DeleteMessageResponse {
  message: string; // Success message
}

// --- Draft Types ---

// The API returns an object with a draft_content property containing an array
export interface DraftResponse {
  draft_content: [string, string]; // [draft_id, content]
}

// Or if you prefer the array approach, you can keep both
export type DraftResponseArray = [string, string];

export interface Draft {
  draft_id: string;
  content: string;
}

// Helper function to convert the object response to an object
export function parseDraftResponse(response: DraftResponse): Draft {
  return {
    draft_id: response.draft_content[0],
    content: response.draft_content[1]
  };
}

// Helper function to convert API Message to frontend Message
export function transformMessage(
  apiMessage: Message, 
  currentUserId: string
): Message {
  const isMine = apiMessage.sender_id === currentUserId;
  
  return {
    ...apiMessage,
    creator_username: isMine ? 'You' : apiMessage.sender_id, // You'll want to map sender_id to username
    is_mine: isMine,
    has_image: apiMessage.has_media,
    image_id: apiMessage.message_picture?.picture_id,
  };
}