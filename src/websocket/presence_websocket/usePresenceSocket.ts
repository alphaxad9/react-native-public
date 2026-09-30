// src/websocket/presence_websocket/usePresenceSocket.ts
import { useEffect, useRef } from 'react';
import { presenceSocket } from './presenceSocket';
import { PresenceWebSocketEvent } from './presenceTypes';

export const usePresenceSocket = (
  isAuthenticated: boolean,
  onMessage?: (event: PresenceWebSocketEvent) => void
) => {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (isAuthenticated) {
      // User logged in: Connect and listen
      presenceSocket.onMessage((event) => {
        if (onMessageRef.current) {
          onMessageRef.current(event);
        }
      });
      presenceSocket.connect();
    } else {
      // User logged out: Disconnect gracefully
      presenceSocket.disconnect();
    }
  }, [isAuthenticated]);
};