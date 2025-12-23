import './App.css'
import socket from "./socket";
import { useEffect } from "react";

function App() {
 
   useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to socket:", socket.id);
    });

    // cleanup (important discipline)
    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <>
      <div>
        <h1>Stream Application</h1>
      </div>
    </>
  )
}

export default App
