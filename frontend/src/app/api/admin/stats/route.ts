import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 1. Get Room Stats
    const keys = await redis.keys('room:*');
    const totalRooms = keys.length;
    
    // 2. Get Visit Stats
    const visitsRaw = await redis.get('stats:visits');
    const totalVisits = parseInt(visitsRaw || '0');

    // 3. Simple Mock for Weekly Stats (Jugaad style)
    const activeRooms = totalRooms; // For now all stored rooms are considered active
    
    return NextResponse.json({
      success: true,
      stats: {
        totalRooms,
        activeRooms,
        totalVisits,
        engagementScore: Math.round((totalRooms / (totalVisits || 1)) * 100)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Stats fetch failed' }, { status: 500 });
  }
}
