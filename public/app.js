const socket = io();

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

const joinView = document.getElementById('join-view');
const chatView = document.getElementById('chat-view');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const joinError = document.getElementById('join-error');

const currentRoomEl = document.getElementById('current-room');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let currentUser = null;
let currentRoom = null;

function setJoinError(message) {
  joinError.textContent = message || '';
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function appendMessage({ username, text, timestamp }) {
  const li = document.createElement('li');

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${username} • ${formatTime(timestamp)}`;

  const body = document.createElement('div');
  body.className = 'text';
  body.textContent = text; // textContent prevents HTML/script injection

  li.appendChild(meta);
  li.appendChild(body);
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const room = roomInput.value.trim();

  if (!USERNAME_REGEX.test(username)) {
    setJoinError('Username must be 3–20 chars and contain only letters, numbers, or underscore.');
    return;
  }

  if (!room) {
    setJoinError('Room name is required.');
    return;
  }

  setJoinError('');
  socket.emit('join_room', { username, room });
});

socket.on('join_error', ({ message }) => {
  setJoinError(message || 'Unable to join room.');
});

socket.on('join_success', ({ username, room }) => {
  currentUser = username;
  currentRoom = room;

  currentRoomEl.textContent = room;
  messagesEl.innerHTML = '';

  joinView.classList.add('hidden');
  chatView.classList.remove('hidden');
  messageInput.focus();
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!currentUser || !currentRoom) {
    return;
  }

  const text = messageInput.value.trim();
  if (!text) {
    return;
  }

  socket.emit('send_message', {
    room: currentRoom,
    username: currentUser,
    text,
    timestamp: new Date().toISOString()
  });

  messageInput.value = '';
  messageInput.focus();
});

socket.on('receive_message', (message) => {
  if (!currentRoom || message.room !== currentRoom) {
    return;
  }
  appendMessage(message);
});
