import * as Ably from 'ably';

let ablyClient: Ably.Realtime | null = null;

export const getAblyClient = async (): Promise<Ably.Realtime> => {
  if (ablyClient) return ablyClient;
  
  // High-Stability Token Auth Jugad
  ablyClient = new Ably.Realtime({ 
    authUrl: '/api/room/token',
    autoConnect: true 
  });
  
  return ablyClient;
};

export const getRoomChannel = (client: Ably.Realtime, roomId: string): Ably.RealtimeChannel => {
  return client.channels.get(`frank-drop-room-${roomId}`);
};
