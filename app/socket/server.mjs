import express from "express";
import http from "http";
import { Server } from "socket.io";

// This url points to our api path, since this socket server is running in nodejs, we need to use specific urls instead of next js dynamic api routing
const api_url = "http://localhost:3000/api";

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
  // In addition to joining the ucid's, we will also join a room with the room name being the users uuid,
  // This is useful when it comes to receiving events such as friend requests
  socket.on("join-room", async ({ ucids, uuid }) => {
    console.log([...ucids, uuid]);
    await socket.join([...ucids, uuid]);
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

  // When a user sends a friend request
  // TODO: Implement friend related actions in websocket (incoming friend req, friend removed you, etc...)
  socket.on("friend-request-sent", async ({ recipient_uuid, sender_uuid }) => {
    try {
      // Get display name of sender
      const sender_name = await fetch(`${api_url}/users`, {
        method: "GET",
        headers: {
          uuid: sender_uuid,
        },
      }).then(async (response) => await response.json());

      console.log(
        `${sender_name.displayName} sent a request to ${recipient_uuid}`
      );
      socket.to(recipient_uuid).emit("friend-request-received", {
        sender_uuid: sender_uuid,
        sender_name: sender_name.displayName,
      });
    } catch (err) {
      console.log(err);
    }
  });

  // When a user unfriends another user
  socket.on("friend-removed", ({ remover_uuid, removed_uuid }) => {
    console.log(`${remover_uuid} removed ${removed_uuid} as a friend!`);
    socket.to(removed_uuid).emit("friend-removed-you", {
      remover_uuid: remover_uuid,
    });
  });
});

server.listen(3001, () => {
  console.log("Socket server listening on port 3001");
});
