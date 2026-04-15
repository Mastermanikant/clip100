import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { NEARBY_TTL_SECONDS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android|phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export async function POST(req: Request) {
  try {
    const { deviceName } = await req.json();
    const userAgent = req.headers.get('user-agent') || '';

    // Hash IP for privacy — never store raw
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')
      .slice(0, 12);
    const key = `nearby:${ipHash}`;

    // Create member entry with full UUID
    const memberId = crypto.randomUUID();
    const deviceType = getDeviceType(userAgent);
    const memberData = JSON.stringify({
      id: memberId,
      name: deviceName || 'Anonymous Device',
      type: deviceType,
      joinedAt: Date.now(),
    });

    await redis.sadd(key, memberData);
    await redis.expire(key, NEARBY_TTL_SECONDS);

    // Get all neighbors
    const membersRaw = await redis.smembers(key);
    const allMembers = membersRaw.map((m) => JSON.parse(m));
    const myDevice = allMembers.find((m) => m.id === memberId);
    const peers = allMembers.filter((m) => m.id !== memberId);

    return NextResponse.json({
      success: true,
      groupId: ipHash,
      myDevice,
      members: peers,
    });
  } catch (error) {
    console.error('[Nearby]', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
