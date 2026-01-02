import dotenv from "dotenv"; // Import dotenv
dotenv.config();
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Message from "./models/message.model.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.error("DB connection failed", err);
  });

//create express app
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

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

  //chat event
  socket.on("chat:message", async ({ roomId, username, message }) => {
    try {
      //save message to db
      const newMessage = await Message.create({
        roomId,
        username,
        message,
      });

      //broadcast the message to others in the room
      io.to(roomId).emit("chat:message", {
        username: newMessage.username,
        message: newMessage.message,
      });
    } catch (err) {
      console.error("Failed to save message", err);
    }
  });

  //video events
  socket.on("video:play", ({ roomId, time }) => {
    console.log("BACKEND video:play from", socket.id);
    socket.to(roomId).emit("video:play", { time });
  });

  socket.on("video:pause", ({ roomId, time }) => {
    socket.to(roomId).emit("video:pause", { time });
  });

  socket.on("video:change", ({ roomId, videoId }) => {
    socket.to(roomId).emit("video:change", { videoId });
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

app.get("/rooms/:roomId/messages", async (req, res) => {
  const { roomId } = req.params;

  const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
  res.json(messages);
});
