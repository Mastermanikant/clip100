import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { roomId, passwordHash } = await req.json();
    const room: any = await kv.get(`room:${roomId}`);

    if (!room) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    if (!room.isPublic && room.passwordHash !== passwordHash) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, room });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Join failed' }, { status: 500 });
  }
}
