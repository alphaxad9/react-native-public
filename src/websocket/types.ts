// src/websocket/types.ts

export interface MessageSentEvent {
  event: 'message_sent';
  message: {
    message_id: string;
    room_id: string;
    sender_id: string;
    content: string | null;
    parent_id?: string | null;
    created_at: string;
    status: string;
    media?: {
      media_id: string;
      media_type: string;
    } | null;
  };
}

export interface MessageDeletedEvent {
  event: 'message_deleted';
  message_id: string;
  room_id: string;
}

export interface MessageEditedEvent {
  event: 'message_edited';
  message_id: string;
  room_id: string;
  content: string;
}

export interface TypingStartedEvent {
  event: 'typing_started';
  user_id: string;
  room_id: string;
}

export interface TypingStoppedEvent {
  event: 'typing_stopped';
  user_id: string;
  room_id: string;
}

// Union type of all possible events the frontend cares about
export type WebSocketEvent = 
  | MessageSentEvent 
  | MessageDeletedEvent 
  | MessageEditedEvent
  | TypingStartedEvent
  | TypingStoppedEvent;