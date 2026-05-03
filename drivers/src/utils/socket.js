import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

// Socket created once — NOT auto-connected.
// We connect only after the driver logs in.
export const socket = io(API_URL, {
  path:                '/api/drivers/socket.io',
  autoConnect:         false,
  transports:          ['polling', 'websocket'],
  reconnection:        true,
  reconnectionDelay:   2000,
  reconnectionAttempts: 5,
});

export const API_BASE = API_URL;
