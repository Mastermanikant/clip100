import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { roomId, password, ecosystem = 'link' } = await req.json();
    const roomRaw = await redis.get(`${ecosystem}:${roomId}`);

    if (!roomRaw) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    const room = JSON.parse(roomRaw);

    if (!room.isPublic && password) {
      const passHash = await hashPassword(password);
      if (room.passwordHash !== passHash) {
        return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
      }
    } else if (!room.isPublic) {
       return NextResponse.json({ success: false, message: 'Password required' }, { status: 401 });
    }

    // Sanitize response
    const { passwordHash, ...safeRoom } = room;

    return NextResponse.json({ success: true, room: safeRoom });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Join failed' }, { status: 500 });
  }
}
