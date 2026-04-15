import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { ROOM_TTL_SECONDS, MAX_NOTEBOOK_SIZE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const ecosystem = searchParams.get('ecosystem') || 'notes';

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: 'roomId is required' },
        { status: 400 }
      );
    }

    const roomRaw = await redis.get(`${ecosystem}:${roomId}`);
    const room = roomRaw ? JSON.parse(roomRaw) : null;

    return NextResponse.json({
      success: true,
      notebook: room?.notebook || '',
      charCount: (room?.notebook || '').length,
      updatedAt: room?.updatedAt || room?.createdAt || null,
    });
  } catch (error) {
    console.error('[Notebook GET]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notebook' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { roomId, notebookText, ecosystem = 'notes' } = await req.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: 'roomId is required' },
        { status: 400 }
      );
    }

    // Check size limit
    const textBytes = new TextEncoder().encode(notebookText || '').length;
    if (textBytes > MAX_NOTEBOOK_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Notebook exceeds 100KB limit' },
        { status: 413 }
      );
    }

    const roomRaw = await redis.get(`${ecosystem}:${roomId}`);
    if (!roomRaw) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    const room = JSON.parse(roomRaw);
    room.notebook = notebookText;
    room.updatedAt = Date.now();

    // Refresh TTL on each write
    await redis.set(
      `${ecosystem}:${roomId}`,
      JSON.stringify(room),
      'EX',
      ROOM_TTL_SECONDS
    );

    return NextResponse.json({ success: true, charCount: textBytes });
  } catch (error) {
    console.error('[Notebook PATCH]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notebook' },
      { status: 500 }
    );
  }
}
