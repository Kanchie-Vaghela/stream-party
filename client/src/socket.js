import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default socket;

//side note: We create the socket in socket.js so there is exactly ONE socket connection for the entire frontend, independent of React’s render cycle.
