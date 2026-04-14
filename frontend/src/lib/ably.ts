import Ably from 'ably';

let client: Ably.Realtime | null = null;

export const getAblyClient = async () => {
  if (client) return client;

  // Next.js will fetch the token from our API route
  client = new Ably.Realtime({ authUrl: '/api/room/token' });
  
  await new Promise((resolve, reject) => {
    client?.connection.on('connected', resolve);
    client?.connection.on('failed', reject);
  });

  return client;
};

export const getRoomChannel = (client: Ably.Realtime, roomId: string) => {
  return client.channels.get(`frank-drop:${roomId}`);
};
