import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ecosystem = searchParams.get('ecosystem') || 'link';
  
  try {
    const keys = await redis.keys(`${ecosystem}:*`);
    const items = await Promise.all(keys.slice(0, 50).map(async (key) => {
       const raw = await redis.get(key);
       return raw ? JSON.parse(raw) : null;
    }));

    return NextResponse.json({ success: true, items: items.filter(i => i) });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Fetch failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ecosystem, action } = await req.json();
    
    if (action === 'purge_all') {
      const namespaces = ['link', 'notes', 'nearby'];
      let deletedCount = 0;

      for (const ns of namespaces) {
         const keys = await redis.keys(`${ns}:*`);
         if (keys.length > 0) {
            await redis.del(...keys);
            deletedCount += keys.length;
         }
      }
      
      return NextResponse.json({ success: true, message: `Deleted ${deletedCount} entries.` });
    }

    if (!id || !ecosystem) throw new Error('Params missing');
    await redis.del(`${ecosystem}:${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Operation failed' }, { status: 500 });
  }
}
