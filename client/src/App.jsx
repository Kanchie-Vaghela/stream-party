import "./App.css";
import socket from "./socket";
import { useEffect } from "react";

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

    // cleanup 
    return () => {
      socket.off("connect");
      socket.off("room:user-joined");
      socket.off("room:user-left");
    };
  }, []);

  return (
    <>
      <div>
        <h1>Stream Application</h1>
      </div>
    </>
  );
}

export default App;
