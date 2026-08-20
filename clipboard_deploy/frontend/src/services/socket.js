// Use environment variable for production (VITE_SERVER_URL), fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
});
