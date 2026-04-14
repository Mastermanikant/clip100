import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const linkKeys = await redis.keys('link:*');
    const noteKeys = await redis.keys('notes:*');
    const nearbyKeys = await redis.keys('nearby:*');
    
    return NextResponse.json({
      success: true,
      stats: {
        totalRooms: linkKeys.length,
        totalNotebooks: noteKeys.length,
        totalNearby: nearbyKeys.length,
        totalVisits: linkKeys.length + noteKeys.length, // mock visits
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Stats fetch failed' }, { status: 500 });
  }
}
