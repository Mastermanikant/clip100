import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const ecosystem = searchParams.get('ecosystem') || 'link';

    if (!roomId) {
      return NextResponse.json({ success: false, message: 'Room ID required' }, { status: 400 });
    }

    const exists = await redis.exists(`${ecosystem}:${roomId}`);

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
