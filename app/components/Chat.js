"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

const Chat = () => {
  const uuid = Cookies.get("uuid");

  useEffect(() => {
    socket.emit("client-ready");

    socket.emit("get-messages", uuid);
  }, []);

  const handleChatInput = (event) => {
    // If the user tries to send an empty message, we will exit the function
    if (event.target.value == "") {
      return;
    }

    if (event.key === "Enter") {
      // Try to send a message
      // Todo: IMPLEMENT THIS
      socket.emit("send-a-message");
    }
  };

  return (
    <div className="relative w-full">
      <div className="fixed bottom-6 left-36 right-4">
        <input
          className="bg-gray-500 text-gray-300 relative h-11 rounded-md w-full outline-none p-2"
          placeholder="Send a message..."
          onKeyUp={handleChatInput}
        ></input>
      </div>
    </div>
  );
};

export default Chat;
