import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { deviceName } = await req.json();
    
    // Get IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = crypto.createHash('md5').update(ip).digest('hex').slice(0, 8);
    const key = `nearby:${ipHash}`;
    
    const memberId = crypto.randomUUID().slice(0, 4);
    const memberData = JSON.stringify({ id: memberId, name: deviceName || 'Anonymous', joinedAt: Date.now() });
    
    await redis.sadd(key, memberData);
    await redis.expire(key, 60); // 60s TTL

    const membersRaw = await redis.smembers(key);
    const members = membersRaw.map(m => JSON.parse(m)).filter(m => m.id !== memberId);

    return NextResponse.json({ 
      success: true, 
      groupId: ipHash,
      members 
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
