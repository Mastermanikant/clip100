import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const room: any = await kv.get(`room:${roomId}`);
  return NextResponse.json({ notebook: room?.notebook || '' });
}

export async function PATCH(req: Request) {
  const { roomId, notebookText } = await req.json();
  const room: any = await kv.get(`room:${roomId}`);
  
  if (room) {
    room.notebook = notebookText;
    await kv.set(`room:${roomId}`, room, { ex: 2592000 });
  }
  
  return NextResponse.json({ success: true });
}
