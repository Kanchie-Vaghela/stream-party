import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  // const handleJoin = () => {
  //   if (!roomId) return;
  //   navigate(`/room/${roomId}`);
  // };
  const handleJoin = () => {
  if (!roomId || !username) return;
  navigate(`/room/${roomId}`, {
    state: { username },
  });
};


  return (
    

   <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#1a1a1a,_#000)] text-white">
  <div className="w-full max-w-md px-10 py-12 relative">

    {/* subtle frame */}
    <div className="absolute inset-0 border border-white/10 rounded-none pointer-events-none" />
    <div className="absolute inset-0 -z-10 blur-2xl bg-cyan-500/10" />

    <h1 className="text-5xl font-light tracking-[0.3em] text-center mb-10">
      STREAM
    </h1>
    <input
  placeholder="ENTER USERNAME"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className="w-full bg-transparent border-b border-white/20 
                 px-1 py-3 mb-8
                 text-lg tracking-widest uppercase
                 placeholder-white/30
                 focus:outline-none focus:border-cyan-400
                 transition-colors"
/>


    <input
      placeholder="ROOM CODE"
      value={roomId}
      onChange={(e) => setRoomId(e.target.value)}
      className="w-full bg-transparent border-b border-white/20 
                 px-1 py-3 mb-8
                 text-lg tracking-widest uppercase
                 placeholder-white/30
                 focus:outline-none focus:border-cyan-400
                 transition-colors"
    />

    <button
      onClick={handleJoin}
      className="w-full py-3 mt-2
                 border border-white/20
                 text-sm tracking-[0.3em] uppercase
                 hover:border-cyan-400 hover:text-cyan-400
                 transition-all"
    >
      Enter Room
    </button>

  </div>
</div>


  );
}
