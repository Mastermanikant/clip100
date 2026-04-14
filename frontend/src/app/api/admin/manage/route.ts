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

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
    const { id, ecosystem, action } = await req.json();
    
    if (action === 'purge_all') {
      // THE "NUKER" LOGIC: Find all project-related keys
      const namespaces = ['room', 'nb', 'cb', 'nearby', 'visit', 'stats'];
      let deletedCount = 0;

      for (const ns of namespaces) {
         const keys = await redis.keys(`${ns}:*`);
         if (keys.length > 0) {
            await redis.del(...keys);
            deletedCount += keys.length;
         }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Global Wipe Complete. Deleted ${deletedCount} entries.` 
      });
    }

    if (!id || !ecosystem) throw new Error('Params missing');
    await redis.del(`${ecosystem}:${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Management Error:', error);
    return NextResponse.json({ success: false, message: 'Operation failed' }, { status: 500 });
  }
}
