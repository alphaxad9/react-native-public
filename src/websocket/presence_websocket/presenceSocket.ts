// src/websocket/presence_websocket/presenceSocket.ts
import { WS_BASE_URL } from '../../apis/client';
import { PresenceWebSocketEvent } from './presenceTypes';

// Generate a random device ID for this app session.
// Note: For true persistence across app restarts, store this string in AsyncStorage.
let _deviceId: string | null = null;
const getDeviceId = (): string => {
  if (!_deviceId) {
    _deviceId = `device-${Math.random().toString(36).substring(2, 10)}`;
  }
  return _deviceId;
};

class PresenceSocket {
  private socket: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageCallback: ((event: PresenceWebSocketEvent) => void) | null = null;
  private isManualDisconnect = false;
  private deviceId: string;

  constructor() {
    this.deviceId = getDeviceId();
  }

  connect() {
    // If already connected, do nothing
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManualDisconnect = false;

    // Clean up any dead sockets
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    const wsUrl = `${WS_BASE_URL}ws/presence/?device_id=${this.deviceId}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('✅ Presence WebSocket Connected');
      this.startHeartbeat();
    };

    this.socket.onmessage = (msg) => {
      try {
        const parsedData = JSON.parse(msg.data) as PresenceWebSocketEvent;
        if (this.messageCallback) {
          this.messageCallback(parsedData);
        }
      } catch (error) {
        console.error('Error parsing presence message', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ Presence WebSocket Error');
    };

    this.socket.onclose = (e) => {
      console.log('🔌 Presence WebSocket Closed:', e.code);
      this.stopHeartbeat();
      this.socket = null;

      // If we didn't manually call disconnect(), try to reconnect
      if (!this.isManualDisconnect) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    this.cancelReconnect();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  onMessage(callback: ((event: PresenceWebSocketEvent) => void) | null) {
    this.messageCallback = callback;
  }

  // ── Heartbeat & Reconnect Logic ──────────────────────────────

  private startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing timer
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    this.cancelReconnect();
    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 Reconnecting Presence WebSocket...');
      this.connect();
    }, 5000); // Wait 5 seconds before reconnecting
  }

  private cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const presenceSocket = new PresenceSocket();