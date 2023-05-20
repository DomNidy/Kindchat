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

  socket.on("join-room", async (ucidArray) => {
    await socket.join(ucidArray);
    //console.log("joined room", ucid, socket.id);
  });

  // When a user sends a message
  socket.on("message", ({ messageContent, sender, ucid }) => {
    console.log("received msg", { messageContent, sender, ucid });
    socket.to(ucid).except(socket.id).emit("message-received", {
      event: "received",
      messageContent: messageContent,
      sender: sender,
      ucid: ucid,
      fromClient: false,
    });
  });
});

server.listen(3001, () => {
  console.log("Socket server listening on port 3001");
});
