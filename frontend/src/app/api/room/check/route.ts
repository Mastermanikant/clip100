import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ success: false, message: 'Room ID required' }, { status: 400 });
    }

    const exists = await redis.exists(`room:${roomId}`);

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
