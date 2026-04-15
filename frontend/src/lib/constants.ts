// All magic values in one place. Never hardcode numbers elsewhere.

export const ROOM_TTL_SECONDS = 2592000; // 30 days
export const NEARBY_TTL_SECONDS = 60;    // 1 minute
export const CHUNK_SIZE = 64 * 1024;     // 64KB for WebRTC file chunks
export const MAX_ROOM_ID_LENGTH = 20;
export const MIN_ROOM_ID_LENGTH = 3;
export const MAX_NOTEBOOK_SIZE = 100 * 1024; // 100KB
export const AUTO_SAVE_DELAY_MS = 3000;  // 3 seconds debounce
export const NEARBY_POLL_INTERVAL_MS = 5000; // 5 seconds
export const MAX_RECONNECT_ATTEMPTS = 3;
export const RECONNECT_BASE_DELAY_MS = 1000;

export const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
];

export const ECOSYSTEM_PREFIXES = {
  link: 'link',
  notes: 'notes',
  nearby: 'nearby',
} as const;

export type Ecosystem = keyof typeof ECOSYSTEM_PREFIXES;
