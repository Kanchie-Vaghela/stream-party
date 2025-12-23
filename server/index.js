import express from 'express'
import http from "http"
import { Server } from "socket.io";

//create express app
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id)
})

server.listen(port, () => {
  console.log(`server running on port ${port}`)
})


