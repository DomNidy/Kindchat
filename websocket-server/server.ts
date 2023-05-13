const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("client-ready", () => {});

  socket.on("get-messages", (uuid) => {
    console.log("receieved uuid: ", uuid);
  });
});

server.listen(3001, () => {
  console.log("Socket server listening on port 3001");
});
