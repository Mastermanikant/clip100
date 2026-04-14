import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await redis.incr('stats:visits');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
