import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { generateId, ROOM_TTL_SECONDS } from '@/lib/utils'; // wait, generateId is in utils, ROOM_TTL_SECONDS is in constants
import { hashPassword } from '@/lib/crypto';
import { ROOM_TTL_SECONDS as TTL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { vanityName, password, isPublic, initialMode, adminId, ecosystem = 'link' } = await req.json();
    
    // Use vanity or random 6 char
    const roomId = (vanityName || Math.random().toString(36).substring(2, 8)).toLowerCase();
    
    let passwordHash = '';
    if (password) {
       passwordHash = await hashPassword(password);
    }

    const roomData = {
      roomId,
      passwordHash,
      isPublic: isPublic !== false && !password,
      initialMode,
      adminId,
      createdAt: Date.now(),
      ecosystem 
    };

    await redis.set(`${ecosystem}:${roomId}`, JSON.stringify(roomData), 'EX', TTL);

    return NextResponse.json({ success: true, roomId, ecosystem });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create room' }, { status: 500 });
  }
}
