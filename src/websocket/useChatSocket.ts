// src/websocket/useChatSocket.ts
import { useEffect, useRef } from 'react';
import { chatSocket } from './chatSocket';
import { WebSocketEvent } from './types';

export const useChatSocket = (roomId: string, onMessage: (event: WebSocketEvent) => void) => {
  // We use a ref for the callback to prevent unnecessary socket reconnections 
  // if the parent component re-renders and passes a new function reference.
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomId) {
      console.warn('⚠️ Cannot connect WebSocket: Missing roomId');
      return;
    }

    // Pass a stable function to the socket that delegates to our ref
    chatSocket.onMessage((event) => {
      onMessageRef.current(event);
    });

    // Connect the socket. No token is passed manually, 
    // relying on the same cookie-based auth as your HTTP client.
    chatSocket.connect(roomId);

    // Cleanup on unmount or when roomId changes
    return () => {
      chatSocket.disconnect();
    };
  }, [roomId]);
};