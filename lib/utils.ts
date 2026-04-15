export const generateId = (): string =>
  Math.random().toString(36).substring(2, 12);

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

export const formatSpeed = (bytesPerSec: number): string => {
  if (bytesPerSec === 0) return '0 B/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(1024));
  return `${(bytesPerSec / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

export const isValidRoomId = (id: string): boolean =>
  /^[a-zA-Z0-9-]{3,20}$/.test(id);

export const sanitizeRoomId = (id: string): string =>
  id.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 20);
