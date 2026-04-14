import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { vanityName, passwordHash, isPublic, isPro } = await req.json();
    
    // Native ID generator to bypass ESM conflicts
    const generateId = () => Math.random().toString(36).substring(2, 12);
    const roomId = vanityName || generateId();

    // Store room metadata with 30-day TTL (2592000 seconds)
    const roomData = {
      roomId,
      passwordHash,
      isPublic,
      isPro,
      createdAt: Date.now(),
      notebook: ''
    };

    await kv.set(`room:${roomId}`, roomData, { ex: 2592000 });

    return NextResponse.json({ success: true, roomId });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create room' }, { status: 500 });
  }
}
