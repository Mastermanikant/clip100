import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { vanityName, passwordHash, isPublic, viewLimit, isPro } = await req.json();

    // Use vanity name or generate a short ID
    const roomId = vanityName ? vanityName.toLowerCase().replace(/[^a-z0-9-]/g, '-') : nanoid(10);
    
    // Check if vanity name is taken
    if (vanityName) {
      const existing = await kv.get(`room:${roomId}`);
      if (existing) {
        return NextResponse.json({ success: false, message: 'Room name already taken' }, { status: 400 });
      }
    }

    const roomData = {
      roomId,
      passwordHash: passwordHash || null,
      isPublic: !!isPublic,
      viewLimit: viewLimit || 0, // 0 = unlimited
      viewCount: 0,
      isPro: !!isPro,
      createdAt: Date.now(),
      notebook: '', // The persistent text storage (The Notebook)
    };

    // Store in KV with 30-day TTL (2592000 seconds)
    await kv.set(`room:${roomId}`, roomData, { ex: 2592000 });

    return NextResponse.json({ success: true, roomId });
  } catch (error) {
    console.error('Room creation error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
