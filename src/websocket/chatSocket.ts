// src/websocket/chatSocket.ts
import { WebSocketEvent } from './types';
// Import the centralized WS base URL from your client configuration
import { WS_BASE_URL } from '../apis/client'; 

class ChatSocket {
  private socket: WebSocket | null = null;
  private messageCallback: ((event: WebSocketEvent) => void) | null = null;

  connect(roomId: string) {
    // Close existing connection if one exists
    if (this.socket) {
      this.disconnect();
    }

    // Just like your HTTP client uses `withCredentials: true` to automatically 
    // send cookies, we rely on the WebSocket handshake to automatically include 
    // the session cookies for authentication. No need to manually extract or pass the token.
    const wsUrl = `${WS_BASE_URL}ws/chat/${roomId}/`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log(`✅ WebSocket Connected to room ${roomId}`);
    };

    this.socket.onmessage = (msg) => {
      try {
        const parsedData = JSON.parse(msg.data) as WebSocketEvent;
        console.log('📩 WS Received Event:', parsedData.event, parsedData);
        
        if (this.messageCallback) {
          this.messageCallback(parsedData);
        }
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
    };

    this.socket.onclose = (e) => {
      console.log(`🔌 WebSocket Disconnected. Code: ${e.code}`);
      this.socket = null;
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.messageCallback = null;
    }
  }

  onMessage(callback: (event: WebSocketEvent) => void) {
    this.messageCallback = callback;
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('📤 WS Sending Event:', data.type, data);
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WS Not connected. Cannot send:', data);
    }
  }
}

// Export a singleton instance so the whole app shares the same connection state
export const chatSocket = new ChatSocket();