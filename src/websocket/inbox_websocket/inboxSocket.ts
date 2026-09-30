// src/websocket/inboxSocket.ts
import { InboxWebSocketEvent } from './inboxTypes';
import { WS_BASE_URL } from '../../apis/client';

class InboxSocket {
  private socket: WebSocket | null = null;
  private messageCallback: ((event: InboxWebSocketEvent) => void) | null = null;

  connect() {
    // FIX 1: If already connected, DO NOT reconnect!
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // FIX 2: If a socket exists but is closing/closed, close it 
    // WITHOUT wiping the callback!
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    const wsUrl = `${WS_BASE_URL}ws/inbox/`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
    //   console.log(`✅ Inbox WebSocket Connected`);
    };

    this.socket.onmessage = (msg) => {
      try {
        const parsedData = JSON.parse(msg.data) as InboxWebSocketEvent;
        
    
        if (this.messageCallback) {
          this.messageCallback(parsedData);
        }
      } catch (error) {
      }
    };

    this.socket.onerror = (error) => {
    };

    this.socket.onclose = (e) => {
      this.socket = null;
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      // FIX 3: DO NOT WIPE messageCallback HERE!
      // The callback should persist across reconnections.
    }
  }

  onMessage(callback: ((event: InboxWebSocketEvent) => void) | null) {
    this.messageCallback = callback;
  }
}

export const inboxSocket = new InboxSocket();