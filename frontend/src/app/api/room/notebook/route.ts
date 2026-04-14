import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Get or Update the shared notebook text in a room
export async function PATCH(req: Request) {
  try {
    const { roomId, notebookText } = await req.json();

    if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

    const key = `room:${roomId}`;
    const roomData: any = await kv.get(key);

    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    roomData.notebook = notebookText;

    // Update with same TTL (30 days from creation)
    await kv.set(key, roomData, { keepTtl: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

  const roomData: any = await kv.get(`room:${roomId}`);
  return NextResponse.json({ notebook: roomData?.notebook || '' });
}
