import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { roomId, passwordHash, ecosystem = 'room' } = await req.json();
    const roomRaw = await redis.get(`${ecosystem}:${roomId}`);

    if (!roomRaw) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    const room = JSON.parse(roomRaw);

    if (!room.isPublic && room.passwordHash !== passwordHash) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, room });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Join failed' }, { status: 500 });
  }
}
