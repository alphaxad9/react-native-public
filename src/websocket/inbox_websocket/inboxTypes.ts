// src/websocket/inbox_websocket/inboxTypes.ts
export interface RoomUpdatedEvent {
  event: 'room_updated';
  room: {
    room_id: string;
    last_message: string;
    last_activity_at: string;
    sender_username: string;
  };
}

// Future inbox events can be added here as your system grows
// export interface RoomCreatedEvent { ... }
// export interface RoomArchivedEvent { ... }

// Union type of all possible inbox events the frontend cares about
export type InboxWebSocketEvent = 
  | RoomUpdatedEvent;