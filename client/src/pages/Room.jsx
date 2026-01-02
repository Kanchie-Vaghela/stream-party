import socket from "../socket";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";

const Room = () => {
  let isSyncing = false;
  const isSyncingRef = useRef(false);
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || "anonymous";

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ"); // default

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to socket:", socket.id);
    });

    socket.emit("room:join", {
      roomId: roomId,
      username: "kanchi",
    });

    socket.on("room:user-joined", ({ username }) => {
      console.log(`${username} joined the room`);
    });

    socket.on("room:user-left", ({ username }) => {
      console.log(`${username} left the room`);
    });

    socket.on("chat:message", ({ username, message }) => {
      setchathistory((prev) => [...prev, { username, message }]);
    });

    socket.on("video:play", ({ time }) => {
      console.log("RECEIVED video:play", time);
      isSyncingRef.current = true;
      playerRef.current.seekTo(time, true);
      playerRef.current.playVideo();

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 300);
    });

    socket.on("video:pause", ({ time }) => {
      isSyncingRef.current = true;
      playerRef.current.seekTo(time, true);
      playerRef.current.pauseVideo();

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 300);
    });

    socket.on("video:change", ({ videoId }) => {
      setVideoId(videoId);
    });

    // cleanup
    return () => {
      socket.off("connect");
      socket.off("room:user-joined");
      socket.off("room:user-left");
      socket.off("chat:message");
    };
  }, []);

  // Fetch chat history
  useEffect(() => {
    fetch(`http://localhost:3000/rooms/${roomId}/messages`)
      .then((res) => res.json())
      .then((data) => setchathistory(data));
  }, [roomId]);

  //youtube iframe
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  const playerRef = useRef(null);

  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new YT.Player("player", {
      videoId: "dQw4w9WgXcQ", // replace later
      events: {
        onStateChange: onPlayerStateChange,
      },
    });
  };

  function onPlayerStateChange(event) {
    // 🔒 Guard: don't emit if change came from socket sync
    if (isSyncingRef.current) return;

    if (event.data === YT.PlayerState.PLAYING) {
      socket.emit("video:play", {
        roomId,
        time: playerRef.current.getCurrentTime(),
      });
    }

    if (event.data === YT.PlayerState.PAUSED) {
      socket.emit("video:pause", {
        roomId,
        time: playerRef.current.getCurrentTime(),
      });
    }
  }

  // Load video from URL
  function extractVideoId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
      if (u.searchParams.get("v")) return u.searchParams.get("v");
    } catch {}
    return null;
  }
  function handleLoadVideo() {
    const id = extractVideoId(youtubeUrl);
    if (!id) return;
    setVideoId(id);
    socket.emit("video:change", {
      roomId,
      videoId: id,
    });
  }

  useEffect(() => {
    if (!window.YT || !window.YT.Player) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new YT.Player("player", {
      videoId,
      events: {
        onStateChange: onPlayerStateChange,
      },
    });
  }, [videoId]);

  const [message, setMessage] = useState(""); // input text
  const [chathistory, setchathistory] = useState([]); // chat history

  return (
    <>
      {/* header */}
      <div className="px-8 py-6 bg-black border-b border-white/10">
        <h1 className="text-2xl tracking-[0.4em]  font-light uppercase text-white/90">
          Stream Application
        </h1>
      </div>

      {/* main layout */}
      <div className="grid grid-cols-3 gap-6 px-8 py-6 min-h-[calc(100vh-80px)] bg-black text-white">
        {/* video panel */}
        <div className="col-span-2 flex flex-col border border-white/10">
          {/* video controls */}
          <div className="p-4 border-b border-white/10 flex gap-4">
            <input
              placeholder="PASTE YOUTUBE LINK"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 bg-transparent border-b border-white/20 
                     px-2 py-2 text-sm tracking-widest uppercase
                     placeholder-white/30 focus:outline-none 
                     focus:border-cyan-400 transition-colors"
            />
            <button
              onClick={handleLoadVideo}
              className="px-6 py-2 border border-white/20
                     text-xs tracking-[0.3em] uppercase
                     hover:border-cyan-400 hover:text-cyan-400
                     transition-all"
            >
              Load
            </button>
          </div>

          {/* video player */}
          <div className="flex-1 flex items-center justify-center bg-black">
            <div id="player" />
          </div>
        </div>


        {/* chat panel */}
        <div className="col-span-1 flex flex-col border border-white/10">

          {/* chat history */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm">
            {chathistory.map((msg, index) => (
              <div key={index} className="text-white/80">
                <span className="text-cyan-400 tracking-wide">
                  {msg.username}
                </span>
                <span className="ml-2">{msg.message}</span>
              </div>
            ))}
          </div>

          {/* message input */}
          <div className="border-t border-white/10 p-4 flex gap-3">
            <input
              type="text"
              placeholder="TYPE MESSAGE"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent border-b border-white/20 
                     px-2 py-2 text-sm tracking-widest uppercase
                     placeholder-white/30 focus:outline-none 
                     focus:border-cyan-400 transition-colors"
            />
            <button
              onClick={() => {
                socket.emit("chat:message", {
                  roomId: roomId,
                  username: username,
                  message: message,
                });
                setMessage("");
              }}
              className="px-4 py-2 border border-white/20
                     text-xs tracking-[0.3em] uppercase
                     hover:border-cyan-400 hover:text-cyan-400
                     transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Room;
