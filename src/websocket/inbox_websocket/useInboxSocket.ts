// src/websocket/inbox_websocket/useInboxSocket.ts
import { useEffect, useRef } from 'react';
import { inboxSocket } from './inboxSocket'; // Keep your exact import path
import { InboxWebSocketEvent } from './inboxTypes';

export const useInboxSocket = (onMessage: (event: InboxWebSocketEvent) => void) => {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    inboxSocket.onMessage((event) => {
      onMessageRef.current(event);
    });

    inboxSocket.connect();

    return () => {
      // FIX 4: Explicitly clear the callback on unmount
      inboxSocket.onMessage(null); 
      inboxSocket.disconnect();
    };
  }, []);
};