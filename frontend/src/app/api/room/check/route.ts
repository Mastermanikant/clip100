import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { isValidRoomId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const ecosystem = searchParams.get('ecosystem') || 'link';

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: 'roomId is required' },
        { status: 400 }
      );
    }

    if (!isValidRoomId(roomId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid room ID format' },
        { status: 400 }
      );
    }

    const exists = await redis.exists(`${ecosystem}:${roomId}`);

    return NextResponse.json({
      success: true,
      available: exists === 0,
    });
  } catch (error) {
    console.error('[Room Check]', error);
    return NextResponse.json(
      { success: false, message: 'Availability check failed' },
      { status: 500 }
    );
  }
}
