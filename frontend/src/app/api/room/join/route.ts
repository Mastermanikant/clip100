import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { roomId, password, ecosystem = 'link' } = await req.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: 'roomId is required' },
        { status: 400 }
      );
    }

    const roomRaw = await redis.get(`${ecosystem}:${roomId}`);
    if (!roomRaw) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    const room = JSON.parse(roomRaw);

    // If room has a password, verify it
    if (!room.isPublic && room.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { success: false, message: 'Password required', needsPassword: true },
          { status: 401 }
        );
      }

      const inputHash = await hashPassword(password);
      if (inputHash !== room.passwordHash) {
        return NextResponse.json(
          { success: false, message: 'Invalid password' },
          { status: 401 }
        );
      }
    }

    // Strip sensitive data before sending to client (Bug #9 fix)
    const { passwordHash, ...safeRoom } = room;

    return NextResponse.json({ success: true, room: safeRoom });
  } catch (error) {
    console.error('[Room Join]', error);
    return NextResponse.json(
      { success: false, message: 'Join failed' },
      { status: 500 }
    );
  }
}
