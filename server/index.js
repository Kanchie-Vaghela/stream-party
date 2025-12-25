import express from "express";
import http from "http";
import { Server } from "socket.io";

//create express app
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  //room join event
  socket.on("room:join", ({ username, roomId }) => {
    socket.join(roomId);

    // STORE data on the socket
    socket.roomId = roomId;
    socket.username = username;

    // notify others in the room
    socket.to(roomId).emit("room:user-joined", {
      username,
    });

    console.log(`${username} is joined room ${roomId}`);
  });

  //handle disconnect
  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);

    socket.to(socket.roomId).emit("room:user-left", {
      username: socket.username,
    });
  });
});

server.listen(port, () => {
  console.log(`server running on port ${port}`);
});
