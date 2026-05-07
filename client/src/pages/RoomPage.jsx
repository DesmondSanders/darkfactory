import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { socket } from '../socket';

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RoomPage() {
  const { room: roomParam } = useParams();
  const room = decodeURIComponent(roomParam || '').trim();
  const location = useLocation();
  const navigate = useNavigate();

  const username = useMemo(() => {
    const fromState = location.state?.username;
    return typeof fromState === 'string' ? fromState.trim() : '';
  }, [location.state]);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (!username || !room) {
      navigate('/');
      return;
    }

    if (!socket.connected) socket.connect();

    socket.emit('join_room', { username, room });

    const onReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onUserJoined = (evt) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `join-${evt.username}-${evt.timestamp}`,
          room: evt.room,
          username: 'system',
          text: `${evt.username} joined the room`,
          timestamp: evt.timestamp
        }
      ]);
    };

    const onUserLeft = (evt) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `left-${evt.username}-${evt.timestamp}`,
          room: evt.room,
          username: 'system',
          text: `${evt.username} left the room`,
          timestamp: evt.timestamp
        }
      ]);
    };

    socket.on('receive_message', onReceive);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.disconnect();
    };
  }, [navigate, room, username]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;

    socket.emit('send_message', {
      room,
      username,
      text: clean
    });

    setText('');
  };

  return (
    <div className="page">
      <div className="chat-layout">
        <header className="chat-header">
          <div>
            <strong>Room:</strong> {room}
          </div>
          <div>
            <strong>User:</strong> {username}
          </div>
        </header>

        <div className="messages" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`message ${m.username === 'system' ? 'system' : ''}`}>
              <div className="meta">
                <span>{m.username}</span>
                <span>{formatTime(m.timestamp)}</span>
              </div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>

        <form className="composer" onSubmit={sendMessage}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
