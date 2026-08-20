import { io } from 'socket.io-client';

// Use environment variable for production (VITE_SERVER_URL)
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'https://clipboard-api.frankbase.com';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
});

