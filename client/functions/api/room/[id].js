// Cloudflare Pages Function for Edge Room Synchronization & In-Memory/KV Store
// Memory store across edge requests (volatile in-memory edge cache)
const edgeRooms = new Map();

export async function onRequestGet({ params, request }) {
  const roomId = params.id;
  const url = new URL(request.url);
  const pin = url.searchParams.get('pin') || '';

  const room = edgeRooms.get(roomId) || {
    content: '',
    imageData: null,
    hasPin: false,
    pin: null,
    lastAccessed: Date.now(),
    userCount: 1
  };

  room.lastAccessed = Date.now();

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
        'Cache-Control': 'no-store'
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
    userCount: room.userCount || 1
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
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
      edgeRooms.set(roomId, room);
    }

    if (body.content !== undefined) room.content = body.content;
    if (body.imageData !== undefined) room.imageData = body.imageData;
    if (body.pin !== undefined) {
      room.pin = body.pin;
      room.hasPin = !!body.pin;
    }
    room.lastAccessed = Date.now();

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
        'Cache-Control': 'no-store'
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
