import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", async (socket) => {
  console.log(`Socket connected with socked.id of ${socket.id}`);

  // Join all rooms the user has access to
  socket.on("join-room", async (ucidArray) => {
    await socket.join(ucidArray);
  });

  // When a user sends a message
  socket.on("message-sent", ({ messageContent, sender, ucid }) => {
    console.log("received msg", { messageContent, sender, ucid });
    socket.to(ucid).except(socket.id).emit("message-received", {
      location: "from socket server",
      messageContent: messageContent,
      sender_uuid: sender,
      ucid: ucid,
      fromClient: false,
      timestamp: Date.now(),
    });
  });
});

server.listen(3001, () => {
  console.log("Socket server listening on port 3001");
});
