import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!roomId) return;
    navigate(`/room/${roomId}`);
  };

  return (
    <div>
      <h1>Stream Party</h1>
      <input
        placeholder="Enter room id"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
}
