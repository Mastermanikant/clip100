import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { vanityName, passwordHash, isPublic, isPro, initialMode, adminId, ecosystem = 'room' } = await req.json();
    
    // Native ID generator
    const generateId = () => Math.random().toString(36).substring(2, 12);
    const roomId = vanityName || generateId();

    const roomData = {
      roomId,
      passwordHash,
      isPublic,
      isPro,
      initialMode,
      adminId,
      createdAt: Date.now(),
      notebook: '',
      ecosystem // Store the type
    };

    // Use specific prefix for logical separation
    await redis.set(`${ecosystem}:${roomId}`, JSON.stringify(roomData), 'EX', 2592000);

    return NextResponse.json({ success: true, roomId, ecosystem });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create room' }, { status: 500 });
  }
}
