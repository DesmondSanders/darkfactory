# Socket.IO Room Chat

Simple local room-based chat using Node.js, Express, Socket.IO, and vanilla HTML/CSS/JS.

## Run locally

1. Install dependencies:
   npm install
2. Start server:
   npm start
3. Open:
   http://localhost:3000

Open two browser tabs/windows to test real-time room chat.

## Socket.IO events

- Client -> Server: `join_room`, `send_message`
- Server -> Client: `join_success`, `join_error`, `receive_message`, `system_message`

## Notes

- Username validation: 3-20 chars, letters/numbers/underscore only.
- Username uniqueness is enforced per room.
- Same username can be used in different rooms.
- In-memory state only; restart clears rooms/users/messages.
