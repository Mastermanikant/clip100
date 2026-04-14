import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const ecosystem = searchParams.get('ecosystem') || 'notes';
  
  if (!roomId) return NextResponse.json({ notebook: '' });

  const roomRaw = await redis.get(`${ecosystem}:${roomId}`);
  const room = roomRaw ? JSON.parse(roomRaw) : null;
  return NextResponse.json({ notebook: room?.notebook || '' });
}

export async function PATCH(req: Request) {
  const { roomId, notebookText, ecosystem = 'notes' } = await req.json();
  const roomRaw = await redis.get(`${ecosystem}:${roomId}`);
  
  if (roomRaw) {
    const room = JSON.parse(roomRaw);
    room.notebook = notebookText;
    await redis.set(`${ecosystem}:${roomId}`, JSON.stringify(room), 'EX', 2592000);
  }
  
  return NextResponse.json({ success: true });
}
