export const ROOM_TTL_SECONDS = 2592000; // 30 days
export const NEARBY_TTL_SECONDS = 60;
export const CHUNK_SIZE = 64 * 1024; // 64KB for WebRTC chunks
export const MAX_ROOM_ID_LENGTH = 20;
export const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
