// Cloudflare Pages Function for Edge Room Synchronization & Global Cache API
const edgeRooms = new Map();

function getCacheKey(roomId) {
  return new Request(`https://clipsync-edge-store.internal/room/${encodeURIComponent(roomId)}`, {
    method: 'GET'
  });
}

export async function onRequestGet({ params, request }) {
  const roomId = params.id;
  const url = new URL(request.url);
  const pin = url.searchParams.get('pin') || '';

  let room = edgeRooms.get(roomId);

  // If not in local isolate memory, check Cloudflare Global Edge Cache
  if (!room) {
    try {
      const cache = caches.default;
      const cacheKey = getCacheKey(roomId);
      const cachedRes = await cache.match(cacheKey);
      if (cachedRes) {
        room = await cachedRes.json();
        edgeRooms.set(roomId, room);
      }
    } catch (e) {}
  }

  if (!room) {
    room = {
      content: '',
      imageData: null,
      hasPin: false,
      pin: null,
      lastAccessed: Date.now(),
      userCount: 1
    };
  }

  // If room is PIN protected and pin is not provided or incorrect
  if (room.pin && room.pin !== pin) {
    return new Response(JSON.stringify({
      roomId,
      isLocked: true,
      unlocked: false,
      hasPin: true,
      userCount: room.userCount || 1
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
    content: room.content || '',
    imageData: room.imageData || null,
    hasPin: !!room.pin,
    isLocked: false,
    unlocked: true,
    userCount: room.userCount || 1,
    lastAccessed: room.lastAccessed
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

export async function onRequestPost({ params, request }) {
  const roomId = params.id;
  try {
    const body = await request.json();
    let room = edgeRooms.get(roomId);

    if (!room) {
      room = {
        content: '',
        imageData: null,
        pin: null,
        hasPin: false,
        lastAccessed: Date.now(),
        userCount: 1
      };
    }

    if (body.content !== undefined) room.content = body.content;
    if (body.imageData !== undefined) room.imageData = body.imageData;
    if (body.pin !== undefined) {
      room.pin = body.pin;
      room.hasPin = !!body.pin;
    }
    room.lastAccessed = Date.now();

    // Store in isolate memory
    edgeRooms.set(roomId, room);

    // Persist to Cloudflare Edge Cache API (stored for 30 days = 2592000s)
    try {
      const cache = caches.default;
      const cacheKey = getCacheKey(roomId);
      const cacheResponse = new Response(JSON.stringify(room), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=2592000'
        }
      });
      await cache.put(cacheKey, cacheResponse);
    } catch (cacheErr) {}

    return new Response(JSON.stringify({
      success: true,
      roomId,
      content: room.content,
      imageData: room.imageData,
      hasPin: room.hasPin
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
