import "./App.css";
import socket from "./socket";
import { useEffect, useState } from "react";

function App() {
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

  const [message, setMessage] = useState("");     // input text
  const [chathistory, setchathistory] = useState([]);   // chat history


  return (
    <>
      <div>
        <h1>Stream Application</h1>
      </div>

      <div>
        {chathistory.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

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
    </>
  );
}

export default App;
