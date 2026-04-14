import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { vanityName, passwordHash, isPublic, adminId } = await req.json();
    
    // JUGAD: Use vanityName if available, else nanoid
    const roomId = vanityName ? vanityName.toLowerCase().replace(/[^a-z0-9-]/g, '') : nanoid(10);
    
    // Check if exists
    const exists = await redis.exists(`room:${roomId}`);
    if (exists && vanityName) {
      return NextResponse.json({ success: false, message: 'ID_TAKEN' }, { status: 400 });
    }

    const roomData = {
      roomId,
      passwordHash: passwordHash || '',
      isPublic: !!isPublic,
      adminId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };

    await redis.set(`room:${roomId}`, JSON.stringify(roomData), 'EX', 30 * 24 * 60 * 60);
    
    return NextResponse.json({ success: true, roomId });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
