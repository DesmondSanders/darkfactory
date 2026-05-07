import { Routes, Route } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import RoomPage from './pages/RoomPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinPage />} />
      <Route path="/room/:room" element={<RoomPage />} />
    </Routes>
  );
}
