// JUGAD: Use Dynamic Imports to ensure NO Ably SDK code runs on server/build
let ablyClient: any = null;

export const getAblyClient = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;
  if (ablyClient) return ablyClient;
  
  // High-Stability Client-Side Only Import
  const Ably = await import('ably');
  
  ablyClient = new Ably.Realtime({ 
    authUrl: '/api/room/token',
    autoConnect: true 
  });
  
  return ablyClient;
};

export const getRoomChannel = (client: any, roomId: string): any => {
  return client.channels.get(`frank-drop-room-${roomId}`);
};
