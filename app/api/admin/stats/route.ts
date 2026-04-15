import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const linkKeys = await redis.keys('link:*');
    const notesKeys = await redis.keys('notes:*');
    const nearbyKeys = await redis.keys('nearby:*');
    const visitsRaw = await redis.get('stats:visits');
    const totalVisits = parseInt(visitsRaw || '0');

    return NextResponse.json({
      success: true,
      stats: {
        totalRooms: linkKeys.length,
        totalNotebooks: notesKeys.length,
        totalNearby: nearbyKeys.length,
        totalVisits,
      },
    });
  } catch (error) {
    console.error('[Admin Stats]', error);
    return NextResponse.json(
      { success: false, message: 'Stats fetch failed' },
      { status: 500 }
    );
  }
}
