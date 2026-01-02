import socket from "../socket";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const Room = () => {
  let isSyncing = false;
  const isSyncingRef = useRef(false);
  const { roomId } = useParams();

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
      <div>
        <h1>Stream Application</h1>
      </div>

      {/* chat history display */}
      <div>
        {chathistory.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {/* message input and send button */}
      <div>
        <input
          type="text"
          placeholder="type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={() => {
            socket.emit("chat:message", {
              roomId: roomId,
              username: "kanchi",
              message: message,
            });
            setMessage("");
          }}
        >
          Send
        </button>
      </div>

      {/* video stream */}
      <input
        placeholder="Paste YouTube link"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
      />
      <button onClick={handleLoadVideo}>Load</button>
      <div id="player"></div>
    </>
  );
};

export default Room;
