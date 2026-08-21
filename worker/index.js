// Cloudflare Worker API for 100% Reliable Cross-Device Sync on Cloudflare D1 Edge

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    };

    // Health check
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({ status: 'ok', service: 'clipsync-d1-api', region: 'edge' }), { headers });
    }

    // Match /api/room/:id
    const match = url.pathname.match(/^\/api\/room\/([^/]+)$/);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers });
    }

    const roomId = decodeURIComponent(match[1]);
    const pin = url.searchParams.get('pin') || '';

    // GET /api/room/:id
    if (request.method === 'GET') {
      try {
        const stmt = env.DB.prepare('SELECT room_id, pin, messages_json, last_accessed FROM rooms WHERE room_id = ?');
        const row = await stmt.bind(roomId).first();

        if (!row) {
          return new Response(JSON.stringify({
            roomId,
            messages: [],
            hasPin: false,
            isLocked: false,
            unlocked: true,
            userCount: 1,
            lastAccessed: Date.now()
          }), { headers });
        }

        if (row.pin && row.pin !== pin) {
          return new Response(JSON.stringify({
            roomId,
            isLocked: true,
            unlocked: false,
            hasPin: true,
            userCount: 1
          }), { headers });
        }

        return new Response(JSON.stringify({
          roomId: row.room_id,
          messages: row.messages_json ? JSON.parse(row.messages_json) : [],
          hasPin: !!row.pin,
          isLocked: false,
          unlocked: true,
          userCount: 1,
          lastAccessed: row.last_accessed
        }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
      }
    }

    // POST /api/room/:id
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const action = body.action || 'sync';
        const now = Date.now();

        // Read current state
        let currentMessages = [];
        let currentPin = null;

        const stmt = env.DB.prepare('SELECT pin, messages_json FROM rooms WHERE room_id = ?');
        const row = await stmt.bind(roomId).first();
        if (row) {
          currentPin = row.pin;
          currentMessages = row.messages_json ? JSON.parse(row.messages_json) : [];
        }

        if (action === 'add_message') {
          const newMsg = {
            id: body.message.id || `msg_${now}_${Math.random().toString(36).slice(2, 6)}`,
            deviceId: body.message.deviceId,
            deviceName: body.message.deviceName || 'Unknown Device',
            content: body.message.content || '',
            imageData: body.message.imageData || null,
            timestamp: body.message.timestamp || now,
            isPinned: false
          };
          currentMessages = [newMsg, ...currentMessages];
          if (currentMessages.length > 100) currentMessages.pop();
        } else if (action === 'edit_message') {
          currentMessages = currentMessages.map(m => {
            if (m.id === body.messageId) {
              return { ...m, content: body.content, editedAt: now };
            }
            return m;
          });
        } else if (action === 'delete_message') {
          currentMessages = currentMessages.filter(m => m.id !== body.messageId);
        } else if (action === 'clear_all') {
          currentMessages = [];
        } else if (action === 'set_pin') {
          currentPin = body.pin;
        }

        const messagesJson = JSON.stringify(currentMessages);

        // Upsert into D1
        const upsertStmt = env.DB.prepare(`
          INSERT INTO rooms (room_id, pin, messages_json, last_accessed, created_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(room_id) DO UPDATE SET
            pin = COALESCE(excluded.pin, rooms.pin),
            messages_json = excluded.messages_json,
            last_accessed = excluded.last_accessed
        `);
        await upsertStmt.bind(roomId, currentPin || body.pin || null, messagesJson, now, now).run();

        return new Response(JSON.stringify({
          success: true,
          roomId,
          messages: currentMessages,
          hasPin: !!currentPin
        }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }
};
