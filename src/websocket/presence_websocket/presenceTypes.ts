// src/websocket/presence_websocket/presenceTypes.ts

export interface HeartbeatAckEvent {
  type: 'heartbeat_ack';
}

// Union type of all possible presence events the frontend might receive
export type PresenceWebSocketEvent = HeartbeatAckEvent;