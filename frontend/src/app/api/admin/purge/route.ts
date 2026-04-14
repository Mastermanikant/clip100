import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Categorical Purge Logic (The Broom)
    const prefixes = ['room:', 'nb:', 'cb:', 'nearby:', 'visit:', 'status:', 'stats:'];
    let totalDeleted = 0;

    for (const prefix of prefixes) {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
            await redis.del(...keys);
            totalDeleted += keys.length;
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: 'DATABASE_WIPE_COMPLETE', 
        deletedKeys: totalDeleted 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Purge Failed', error: error.message }, { status: 500 });
  }
}
