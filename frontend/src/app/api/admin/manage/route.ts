import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ecosystem = searchParams.get('ecosystem') || 'room';
  
  try {
    const keys = await redis.keys(`${ecosystem}:*`);
    const items = await Promise.all(keys.slice(0, 100).map(async (key) => {
       const raw = await redis.get(key);
       return raw ? JSON.parse(raw) : null;
    }));

    return NextResponse.json({ success: true, items: items.filter(i => i) });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Fetch failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, ecosystem, action } = await req.json();
    
    if (action === 'purge_all') {
      const ecosystems = ['room', 'nb', 'cb', 'nearby'];
      for (const eco of ecosystems) {
         const keys = await redis.keys(`${eco}:*`);
         if (keys.length > 0) await redis.del(...keys);
      }
      return NextResponse.json({ success: true, message: 'Global Wipe Complete' });
    }

    if (!id || !ecosystem) throw new Error('Params missing');
    await redis.del(`${ecosystem}:${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Operation failed' }, { status: 500 });
  }
}
