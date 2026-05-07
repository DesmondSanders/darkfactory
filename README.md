# Socket.IO Room Chat

Real-time room chat app using Node.js, Express, Socket.IO, and plain HTML/CSS/JS.

## Features

- Join any typed room name (dynamic room creation)
- Username validation: `3–20` chars, `[A-Za-z0-9_]`
- Username uniqueness enforced per room
- Real-time room-scoped messaging
- In-memory users/rooms (cleared on restart)
- Basic safe rendering in UI via `textContent`

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start server:
   ```bash
   npm start
   ```
3. Open:
   `http://localhost:3000`
