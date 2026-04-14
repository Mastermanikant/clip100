import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const roomRaw = await redis.get(`room:${roomId}`);
  const room = roomRaw ? JSON.parse(roomRaw) : null;
  return NextResponse.json({ notebook: room?.notebook || '' });
}

export async function PATCH(req: Request) {
  const { roomId, notebookText } = await req.json();
  const roomRaw = await redis.get(`room:${roomId}`);
  
  if (roomRaw) {
    const room = JSON.parse(roomRaw);
    room.notebook = notebookText;
    await redis.set(`room:${roomId}`, JSON.stringify(room), 'EX', 2592000);
  }
  
  return NextResponse.json({ success: true });
}
