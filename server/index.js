const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'clipsync-websocket-relay', uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 15 * 1024 * 1024 // 15 MB for image/screenshot chunks
});

// In-memory store: roomId -> { users: Set, content: String, imageData: String, pin: String, type: String, lastAccessed: Date }
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Peer connected:', socket.id);

  socket.on('join_room', (data) => {
    let roomId, roomType = 'ephemeral', providedPin = '';

    if (typeof data === 'string') {
      roomId = data;
    } else if (data && typeof data === 'object') {
      roomId = data.roomId;
      roomType = data.type || 'ephemeral';
      providedPin = data.pin || '';
    }

    if (!roomId) roomId = uuidv4().slice(0, 6).toUpperCase();
    roomId = roomId.trim();

    // Initialize room if not exists
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        content: '',
        imageData: null,
        pin: null,
        type: roomType,
        lastAccessed: new Date()
      });
    }

    const room = rooms.get(roomId);
    room.lastAccessed = new Date();

    // Check PIN Lock
    if (room.pin && room.pin !== providedPin) {
      socket.emit('room_joined', {
        roomId: roomId,
        isLocked: true,
        unlocked: false,
        hasPin: true,
        userCount: room.users.size
      });
      return;
    }

    socket.join(roomId);
    room.users.add(socket.id);

    // Notify user of success and current state
    socket.emit('room_joined', {
      roomId: roomId,
      content: room.content,
      imageData: room.imageData,
      hasPin: !!room.pin,
      isLocked: false,
      unlocked: true,
      userCount: room.users.size,
      roomType: room.type
    });

    // Broadcast updated device count to all peers in room
    io.to(roomId).emit('user_count_update', room.users.size);
  });

  // Verify PIN event
  socket.on('verify_pin', ({ roomId, pin }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.pin === pin) {
        socket.join(roomId);
        room.users.add(socket.id);
        socket.emit('pin_verified', {
          success: true,
          content: room.content,
          imageData: room.imageData
        });
        io.to(roomId).emit('user_count_update', room.users.size);
      } else {
        socket.emit('pin_verified', { success: false });
      }
    }
  });

  // Set PIN lock event
  socket.on('set_room_pin', ({ roomId, pin }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.pin = pin;
      room.lastAccessed = new Date();
      console.log(`PIN set for room ${roomId}`);
    }
  });

  // Update content (Text & Screenshots)
  socket.on('update_content', ({ roomId, content, imageData }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (content !== undefined) room.content = content;
      if (imageData !== undefined) room.imageData = imageData;
      room.lastAccessed = new Date();

      // Broadcast update to all other devices in the room
      socket.to(roomId).emit('content_updated', {
        content: room.content,
        imageData: room.imageData
      });
    }
  });

  socket.on('disconnecting', () => {
    const roomsJoined = socket.rooms;
    for (const roomId of roomsJoined) {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.users.delete(socket.id);
        io.to(roomId).emit('user_count_update', room.users.size);
      }
    }
  });
});

// Periodic Garbage Collection: 30 days for custom links/diaries, 24 hours for empty ephemeral rooms
setInterval(() => {
  const now = new Date();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  for (const [roomId, room] of rooms.entries()) {
    const inactiveDuration = now - room.lastAccessed;
    if (room.type === 'custom_link' || room.type === 'diary') {
      if (inactiveDuration > thirtyDaysMs) {
        rooms.delete(roomId);
        console.log(`Garbage collected 30-day inactive custom link: ${roomId}`);
      }
    } else {
      // Ephemeral room
      if (room.users.size === 0 && inactiveDuration > twentyFourHoursMs) {
        rooms.delete(roomId);
        console.log(`Garbage collected inactive ephemeral room: ${roomId}`);
      }
    }
  }
}, 60 * 60 * 1000); // Check every 1 hour

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 ClipSync WebSocket Server listening on port ${PORT}`);
});
