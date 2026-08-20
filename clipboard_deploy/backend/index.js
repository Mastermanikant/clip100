const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for MVP/Demo
    methods: ["GET", "POST"]
  }
});

// In-memory store
const rooms = new Map(); // roomId -> { users: Set, content: String, lastUpdated: Date }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    // Determine room ID (create new if clean custom id provided, or just join)
    const roomToJoin = roomId || uuidv4().slice(0, 6); // Simple 6 char ID if creation
    
    socket.join(roomToJoin);
    
    // Initialize room if not exists
    if (!rooms.has(roomToJoin)) {
      rooms.set(roomToJoin, {
        users: new Set(),
        content: '',
        lastUpdated: new Date()
      });
    }

    const room = rooms.get(roomToJoin);
    room.users.add(socket.id);

    // Notify user of success and current content
    socket.emit('room_joined', { 
      roomId: roomToJoin, 
      content: room.content,
      userCount: room.users.size 
    });

    // Notify others
    io.to(roomToJoin).emit('user_count_update', room.users.size);
  });

  socket.on('update_content', ({ roomId, content }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.content = content;
      room.lastUpdated = new Date();
      // Broadcast to everyone else in the room
      socket.to(roomId).emit('content_updated', content);
    }
  });

  socket.on('disconnecting', () => {
    const roomsJoined = socket.rooms;
    for (const roomId of roomsJoined) {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.users.delete(socket.id);
        io.to(roomId).emit('user_count_update', room.users.size);
        
        // Cleanup empty rooms after a delay (optional simple cleanup)
        if (room.users.size === 0) {
            // Keep content for a bit? For now, we keep it indefinitely in memory until restart
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
