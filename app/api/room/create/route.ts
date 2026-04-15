import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/crypto';
import { ROOM_TTL_SECONDS } from '@/lib/constants';
import { generateId, isValidRoomId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      vanityName,
      password,
      isPublic = true,
      ecosystem = 'link',
    } = body;

    const roomId = vanityName || generateId();

    // Validate room ID
    if (!isValidRoomId(roomId)) {
      return NextResponse.json(
        { success: false, message: 'Room name must be 3-20 alphanumeric characters or hyphens' },
        { status: 400 }
      );
    }

    // Check if room already exists
    const exists = await redis.exists(`${ecosystem}:${roomId}`);
    if (exists) {
      return NextResponse.json(
        { success: false, message: 'Room name is already taken' },
        { status: 409 }
      );
    }

    // Hash password server-side if provided
    const passwordHash = password ? await hashPassword(password) : null;

    const roomData = {
      roomId,
      passwordHash,
      isPublic: !password,
      ecosystem,
      createdAt: Date.now(),
      notebook: '',
    };

    await redis.set(
      `${ecosystem}:${roomId}`,
      JSON.stringify(roomData),
      'EX',
      ROOM_TTL_SECONDS
    );

    return NextResponse.json({ success: true, roomId, ecosystem });
  } catch (error) {
    console.error('[Room Create]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create room' },
      { status: 500 }
    );
  }
}
