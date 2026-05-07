const socket = io();

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

const joinView = document.getElementById('joinView');
const chatView = document.getElementById('chatView');
const usernameInput = document.getElementById('usernameInput');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const joinError = document.getElementById('joinError');
const roomLabel = document.getElementById('roomLabel');
const userLabel = document.getElementById('userLabel');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let currentUser = '';
let currentRoom = '';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addMessage({ username, text, timestamp, system = false }) {
  const li = document.createElement('li');
  const time = new Date(timestamp || Date.now()).toLocaleTimeString();

  if (system) {
    li.innerHTML = `<span class="meta">[${escapeHtml(time)}]</span> <span class="system">${escapeHtml(text)}</span>`;
  } else {
    li.innerHTML = `<span class="meta">[${escapeHtml(time)}]</span><strong>${escapeHtml(username)}:</strong> ${escapeHtml(text)}`;
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function showJoinError(message) {
  joinError.textContent = message || '';
}

joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const room = roomInput.value.trim();

  if (!USERNAME_REGEX.test(username)) {
    showJoinError('Username must be 3-20 characters and contain only letters, numbers, or underscore.');
    return;
  }

  if (!room) {
    showJoinError('Room name is required.');
    return;
  }

  showJoinError('');
  socket.emit('join_room', { username, room });
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('send_message', { text });
  messageInput.value = '';
  messageInput.focus();
});

socket.on('join_error', ({ message }) => {
  showJoinError(message || 'Unable to join room.');
});

socket.on('join_success', ({ username, room }) => {
  currentUser = username;
  currentRoom = room;

  roomLabel.textContent = currentRoom;
  userLabel.textContent = currentUser;
  messages.innerHTML = '';

  joinView.classList.add('hidden');
  chatView.classList.remove('hidden');
  messageInput.focus();
});

socket.on('receive_message', (message) => {
  addMessage(message);
});

socket.on('system_message', (message) => {
  addMessage({ ...message, system: true });
});
