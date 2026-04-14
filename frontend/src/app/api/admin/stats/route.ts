import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Get Ecosystem Stats
    const roomKeys = await redis.keys('room:*');
    const nbKeys = await redis.keys('nb:*');
    const cbKeys = await redis.keys('cb:*');
    
    // 2. Get Visit Stats
    const visitsRaw = await redis.get('stats:visits');
    const totalVisits = parseInt(visitsRaw || '0');

    return NextResponse.json({
      success: true,
      stats: {
        totalRooms: roomKeys.length,
        totalNotebooks: nbKeys.length,
        totalClipboards: cbKeys.length,
        totalVisits,
        engagementScore: Math.round(((roomKeys.length + nbKeys.length + cbKeys.length) / (totalVisits || 1)) * 100)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Stats fetch failed' }, { status: 500 });
  }
}
