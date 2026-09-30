// --- Chat Room Types ---

export interface LastMessage {
  content: string;
  status: string | null;
  has_image: boolean;
  is_mine: boolean;
  sender_username: string;
}

// Define possible room types (extend this union if you have more types like 'direct')
export type RoomType = 'group' | 'private'; 

export interface ChatRoom {
  room_id: string;
  room_name: string;
  last_message: LastMessage | null;
  last_action_at: string; // ISO 8601 date string (e.g., "2026-06-12T14:05:29.788038+00:00")
  room_type: RoomType;
  unread_messages_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  is_archived: boolean;
}

export interface ChatRoomsResponse {
  rooms: ChatRoom[];
  total_count: number;
  has_more: boolean;
}