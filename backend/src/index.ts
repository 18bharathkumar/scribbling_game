import express from "express";
import http from "http";
import WebSocket, { WebSocket as WsSocket } from "ws";

import cors from "cors"

// importing globel variable

import {rooms} from "./globel";

// importing functions 
import { handleJoin,handleGameStart,handleGuess,handleDrawing,cleanupDisconnectedUser,handlecreate } from "./functions";


const app = express();
const port = 3000;
app.use(express.json());
app.use(cors())
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket Handler
wss.on("connection", (socket: WsSocket) => {
  console.log("New client connected");

  socket.on("message", (msg) => {
    const parsedMsg = JSON.parse(msg.toString());
    const type = parsedMsg.type;
    const payload = parsedMsg.payload;

    handleMessage(type, payload, socket);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    cleanupDisconnectedUser(socket);
  });
});

// Message Handling
function handleMessage(type: string, payload: any, socket: WsSocket) {
  const { user,avatar, roomid, secret, message, data } = payload;

  switch (type) {
    case "create":
      console.log("createing the room");
      console.log(payload);
      
      handlecreate(user,avatar, roomid, secret, socket)
      break;
      
    case "join":
      handleJoin(user,avatar, roomid, secret, socket);
      break;
    case "game":
      handleGameStart(roomid, socket);
      break;
    case "gamechat":
      handleGuess(roomid, user, message,socket);
      break;
    case "gamedraw":
      handleDrawing(roomid, user, data,socket);
      break;
  }
}


// Get specific room by ID
app.get("/room/:id", (req: any, res: any) => {
  const roomId = parseInt(req.params.id);

  if (isNaN(roomId)) {
    return res.status(400).json({ message: "Invalid room ID" });
  }

  const room = rooms.find((r) => r.id === roomId);

  if (room) {
    res.json(room.users)
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

// Start Server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
