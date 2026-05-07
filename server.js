const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

// roomName -> Set<username>
const roomUsers = new Map();
// socketId -> { username, room }
const socketMembership = new Map();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function normalize(value) {
  return String(value || '').trim();
}

function ensureRoom(room) {
  if (!roomUsers.has(room)) {
    roomUsers.set(room, new Set());
  }
  return roomUsers.get(room);
}

function leaveCurrentRoom(socket) {
  const member = socketMembership.get(socket.id);
  if (!member) return;

  const { username, room } = member;
  const users = roomUsers.get(room);
  if (users) {
    users.delete(username);
    if (users.size === 0) {
      roomUsers.delete(room);
    }
  }

  socket.leave(room);
  socketMembership.delete(socket.id);

  io.to(room).emit('system_message', {
    username: 'system',
    text: `${username} left the room.`,
    room,
    timestamp: Date.now()
  });
}

io.on('connection', (socket) => {
  socket.on('join_room', (payload = {}) => {
    const username = normalize(payload.username);
    const room = normalize(payload.room);

    if (!USERNAME_REGEX.test(username)) {
      socket.emit('join_error', {
        message: 'Username must be 3-20 characters and contain only letters, numbers, or underscore.'
      });
      return;
    }

    if (!room) {
      socket.emit('join_error', { message: 'Room name is required.' });
      return;
    }

    const existing = socketMembership.get(socket.id);
    if (existing && existing.room === room && existing.username === username) {
      socket.emit('join_success', { username, room });
      return;
    }

    if (existing) {
      leaveCurrentRoom(socket);
    }

    const users = ensureRoom(room);
    if (users.has(username)) {
      socket.emit('join_error', {
        message: `Username "${username}" is already in use in room "${room}".`
      });
      return;
    }

    users.add(username);
    socketMembership.set(socket.id, { username, room });
    socket.join(room);

    socket.emit('join_success', { username, room });

    io.to(room).emit('system_message', {
      username: 'system',
      text: `${username} joined the room.`,
      room,
      timestamp: Date.now()
    });
  });

  socket.on('send_message', (payload = {}) => {
    const member = socketMembership.get(socket.id);
    if (!member) {
      socket.emit('join_error', { message: 'Join a room before sending messages.' });
      return;
    }

    const text = normalize(payload.text);
    if (!text) return;

    const message = {
      username: member.username,
      room: member.room,
      text,
      timestamp: Date.now()
    };

    io.to(member.room).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    leaveCurrentRoom(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
