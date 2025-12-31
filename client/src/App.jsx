import "./App.css";
import socket from "./socket";
import { useEffect, useState , useRef} from "react";



function App() {

    let isSyncing = false;
  const isSyncingRef = useRef(false);
  const roomId = "test-room";


  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to socket:", socket.id);
    });

    socket.emit("room:join", {
      roomId: "test-room",
      username: "kanchi",
    });

    socket.on("room:user-joined", ({ username }) => {
      console.log(`${username} joined the room`);
    });

    socket.on("room:user-left", ({ username }) => {
      console.log(`${username} left the room`);
    });

    socket.on("chat:message", ({ username, message }) => {
      console.log(`${username}: ${message}`);
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
    fetch(`http://localhost:3000/rooms/test-room/messages`)
      .then((res) => res.json())
      .then((data) => setchathistory(data));
  }, []);

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
              roomId: "test-room",
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
      <div>
        <video src="/sample.mp4" controls width="400" />
      </div>

      <div id="player"></div>

    </>
  );
}

export default App;
