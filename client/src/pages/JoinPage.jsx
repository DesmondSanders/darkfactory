import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const cleanUsername = username.trim();
    const cleanRoom = room.trim();

    if (!cleanUsername) nextErrors.username = 'Username is required';
    if (!cleanRoom) nextErrors.room = 'Room is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    navigate(`/room/${encodeURIComponent(cleanRoom)}`, {
      state: { username: cleanUsername }
    });
  };

  return (
    <div className="page center">
      <form className="card" onSubmit={onSubmit}>
        <h1>Join Chat Room</h1>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </label>

        <label>
          Room
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
          />
          {errors.room && <span className="error">{errors.room}</span>}
        </label>

        <button type="submit">Join</button>
      </form>
    </div>
  );
}
