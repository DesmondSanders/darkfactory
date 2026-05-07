import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory membership
// socketId -> { username, room }
const socketMembership = new Map();
// room -> Set<socketId>
const roomMembers = new Map();

const sanitize = (value) => (typeof value === 'string' ? value.trim() : '');

function addMember(socketId, username, room) {
  socketMembership.set(socketId, { username, room });
  if (!roomMembers.has(room)) roomMembers.set(room, new Set());
  roomMembers.get(room).add(socketId);
}

function removeMember(socketId) {
  const member = socketMembership.get(socketId);
  if (!member) return null;

  socketMembership.delete(socketId);
  const set = roomMembers.get(member.room);
  if (set) {
    set.delete(socketId);
    if (set.size === 0) roomMembers.delete(member.room);
  }
  return member;
}

io.on('connection', (socket) => {
  socket.on('join_room', (payload = {}) => {
    const username = sanitize(payload.username);
    const room = sanitize(payload.room);

    if (!username || !room) return;

    // If rejoining from same socket, clean old membership first
    const existing = removeMember(socket.id);
    if (existing) {
      socket.leave(existing.room);
      io.to(existing.room).emit('user_left', {
        username: existing.username,
        room: existing.room,
        timestamp: new Date().toISOString()
      });
    }

    socket.join(room);
    addMember(socket.id, username, room);

    socket.emit('joined_room', { room, username });
    io.to(room).emit('user_joined', {
      username,
      room,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send_message', (payload = {}) => {
    const room = sanitize(payload.room);
    const username = sanitize(payload.username);
    const text = sanitize(payload.text);

    if (!room || !username || !text) return;

    const message = {
      id: crypto.randomUUID(),
      room,
      username,
      text,
      timestamp: new Date().toISOString()
    };

    io.to(room).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    const member = removeMember(socket.id);
    if (!member) return;

    io.to(member.room).emit('user_left', {
      username: member.username,
      room: member.room,
      timestamp: new Date().toISOString()
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
