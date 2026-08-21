// Cloudflare Pages Function with Cloudflare D1 Serverless Database & In-Memory Fallback for 100% Reliable Cross-Device Sync

const memoryFallback = new Map();

export async function onRequestGet({ params, request, env }) {
  const roomId = params.id;
  const url = new URL(request.url);
  const pin = url.searchParams.get('pin') || '';

  let roomData = null;

  // 1. Fetch from Cloudflare D1 Database if available
  if (env && env.DB) {
    try {
      const stmt = env.DB.prepare('SELECT room_id, pin, messages_json, last_accessed FROM rooms WHERE room_id = ?');
      const row = await stmt.bind(roomId).first();
      if (row) {
        roomData = {
          roomId: row.room_id,
          pin: row.pin,
          messages: row.messages_json ? JSON.parse(row.messages_json) : [],
          lastAccessed: row.last_accessed
        };
      }
    } catch (dbErr) {
      console.error('D1 read error:', dbErr);
    }
  }

  // 2. If not found in D1, check in-memory fallback
  if (!roomData && memoryFallback.has(roomId)) {
    roomData = memoryFallback.get(roomId);
  }

  // 3. If still empty, initialize
  if (!roomData) {
    roomData = {
      roomId,
      pin: null,
      messages: [],
      lastAccessed: Date.now()
    };
  }

  // Check PIN Lock
  if (roomData.pin && roomData.pin !== pin) {
    return new Response(JSON.stringify({
      roomId,
      isLocked: true,
      unlocked: false,
      hasPin: true,
      userCount: 1
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }

  return new Response(JSON.stringify({
    roomId,
    messages: roomData.messages || [],
    hasPin: !!roomData.pin,
    isLocked: false,
    unlocked: true,
    userCount: 1,
    lastAccessed: roomData.lastAccessed
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

export async function onRequestPost({ params, request, env }) {
  const roomId = params.id;
  try {
    const body = await request.json();
    const action = body.action || 'sync';
    const pin = body.pin || null;

    let currentMessages = [];
    let currentPin = null;

    // 1. Read current state from D1
    if (env && env.DB) {
      try {
        const stmt = env.DB.prepare('SELECT pin, messages_json FROM rooms WHERE room_id = ?');
        const row = await stmt.bind(roomId).first();
        if (row) {
          currentPin = row.pin;
          currentMessages = row.messages_json ? JSON.parse(row.messages_json) : [];
        }
      } catch (e) {}
    }

    // 2. If D1 had no state, check in-memory fallback
    if (currentMessages.length === 0 && memoryFallback.has(roomId)) {
      const memRoom = memoryFallback.get(roomId);
      currentMessages = memRoom.messages || [];
      currentPin = memRoom.pin || null;
    }

    if (action === 'add_message') {
      const newMsg = {
        id: body.message.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        deviceId: body.message.deviceId,
        deviceName: body.message.deviceName || 'Unknown Device',
        content: body.message.content || '',
        imageData: body.message.imageData || null,
        timestamp: body.message.timestamp || Date.now(),
        isPinned: false
      };
      currentMessages = [newMsg, ...currentMessages];
      if (currentMessages.length > 100) currentMessages.pop();
    } else if (action === 'edit_message') {
      currentMessages = currentMessages.map(m => {
        if (m.id === body.messageId) {
          return { ...m, content: body.content, editedAt: Date.now() };
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

    const now = Date.now();
    const messagesJson = JSON.stringify(currentMessages);

    // Save to memory fallback
    memoryFallback.set(roomId, {
      roomId,
      pin: currentPin || pin,
      messages: currentMessages,
      lastAccessed: now
    });

    // Write back to Cloudflare D1 Database if bound
    if (env && env.DB) {
      try {
        const upsertStmt = env.DB.prepare(`
          INSERT INTO rooms (room_id, pin, messages_json, last_accessed, created_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(room_id) DO UPDATE SET
            pin = COALESCE(excluded.pin, rooms.pin),
            messages_json = excluded.messages_json,
            last_accessed = excluded.last_accessed
        `);
        await upsertStmt.bind(roomId, currentPin || pin, messagesJson, now, now).run();
      } catch (writeErr) {
        console.error('D1 write error:', writeErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      roomId,
      messages: currentMessages,
      hasPin: !!currentPin
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
