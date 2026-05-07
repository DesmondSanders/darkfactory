const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

// In-memory state
// rooms: Map<roomName, Set<username>>
const rooms = new Map();
// socketMembership: Map<socketId, { username, room }>
const socketMembership = new Map();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function isValidUsername(username) {
  return typeof username === 'string' && USERNAME_REGEX.test(username);
}

function isValidRoom(room) {
  return typeof room === 'string' && room.trim().length > 0;
}

io.on('connection', (socket) => {
  socket.on('join_room', (payload = {}) => {
    const username = typeof payload.username === 'string' ? payload.username.trim() : '';
    const room = typeof payload.room === 'string' ? payload.room.trim() : '';

    if (!isValidUsername(username)) {
      socket.emit('join_error', {
        message: 'Invalid username. Use 3–20 characters: letters, numbers, underscore only.'
      });
      return;
    }

    if (!isValidRoom(room)) {
      socket.emit('join_error', { message: 'Room name is required.' });
      return;
    }

    let roomUsers = rooms.get(room);
    if (!roomUsers) {
      roomUsers = new Set();
      rooms.set(room, roomUsers);
    }

    if (roomUsers.has(username)) {
      socket.emit('join_error', {
        message: `Username "${username}" is already in use in room "${room}".`
      });
      return;
    }

    roomUsers.add(username);
    socketMembership.set(socket.id, { username, room });
    socket.join(room);

    socket.emit('join_success', { username, room });
  });

  socket.on('send_message', (payload = {}) => {
    const membership = socketMembership.get(socket.id);
    if (!membership) {
      return;
    }

    const room = typeof payload.room === 'string' ? payload.room.trim() : '';
    const username = typeof payload.username === 'string' ? payload.username.trim() : '';
    const text = typeof payload.text === 'string' ? payload.text.trim() : '';

    if (!text) {
      return;
    }

    // Enforce sender identity and room from server-side membership
    if (room !== membership.room || username !== membership.username) {
      return;
    }

    const message = {
      room: membership.room,
      username: membership.username,
      text,
      timestamp: new Date().toISOString()
    };

    io.to(membership.room).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    const membership = socketMembership.get(socket.id);
    if (!membership) {
      return;
    }

    const { room, username } = membership;
    const roomUsers = rooms.get(room);

    if (roomUsers) {
      roomUsers.delete(username);
      if (roomUsers.size === 0) {
        rooms.delete(room);
      }
    }

    socketMembership.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
