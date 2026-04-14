import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

/**
 * GET /api/room/check?roomId=...
 * Checks if a roomId is currently taken in the KV store.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ success: false, message: 'Room ID required' }, { status: 400 });
    }

    // Check if the key exists in KV
    const exists = await kv.exists(`room:${roomId}`);

    return NextResponse.json({ 
      success: true, 
      available: exists === 0 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to verify availability' 
    }, { status: 500 });
  }
}
