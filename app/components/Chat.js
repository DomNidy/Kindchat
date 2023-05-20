"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

// fromClient (bool): if true this means it is a message we sent and this message object came directly from our client,
// in that case, if the message sender is also our uuid, we SHOULD render it out. This gives the user instant feedback
const MessageBubble = ({ messageContent, sender, timestamp, fromClient }) => {
  const uuid = Cookies.get("uuid");

  if ((sender == uuid && fromClient) || sender != uuid) {
    return (
      <div className="bg-gray-600 rounded-xl p-1">
        {messageContent} {sender} {timestamp}
      </div>
    );
  }
};

const Chat = ({ ucid, messages, setMessages }) => {
  const uuid = Cookies.get("uuid");

  const handleChatInput = async (event) => {
    // If the user tries to send an empty message, we will exit the function
    if (event.target.value == "") {
      return;
    }

    // If the user hits enter, and the ucid is not undefined

    if (event.key === "Enter" && ucid != undefined) {
      // Insert message into messages array for instant feedback
      setMessages((past) => {
        if (past.length >= 1) {
          // if past length is greater than or = to 1, unpack the array and append our message to the end of it
          return [
            ...past,
            {
              messageContent: event.target.value,
              sender: uuid,
              ucid: ucid,
              fromClient: true,
            },
          ];
        }
        return [
          {
            messageContent: event.target.value,
            sender: uuid,
            ucid: ucid,
            fromClient: true,
          },
        ];
      });

      // Request api to send a message
      fetch(`/api/messages/${ucid}`, {
        method: "POST",
        body: JSON.stringify({
          messageContent: event.target.value,
          sender: uuid,
          ucid: ucid,
        }),
      }).then((response) => {
        // If the api request was successful, emit a websocket event so the other user can immediately view this message
        if (response.ok) {
          socket.emit("message", {
            messageContent: event.target.value,
            sender: uuid,
            ucid: ucid,
          });
        }
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-h-screen">
      <div className="h-full overflow-y-auto text-xl text-gray-300 scrollbar-thin scrollbar-thumb-gray-400 ">
        {/* Messages will be displayed in this flex col box*/}
        <div className="flex flex-col m-4 gap-2 mt-9">
          <p>UCID: {ucid}</p>
          {messages.length >= 1 ? (
            messages.map((message, idx, array) => (
              <MessageBubble
                messageContent={message.messageContent}
                sender={message.sender}
                timestamp={"Timestamp not implemented"}
                fromClient={message?.fromClient}
                key={idx}
              />
            ))
          ) : (
            <>
              <p>No messages...</p>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center m-4">
        <input
          className="bg-gray-500 text-gray-300 relative h-11 rounded-md w-full outline-none p-2 shadow-xl"
          placeholder="Send a message..."
          onKeyUp={handleChatInput}
        ></input>
      </div>
    </div>
  );
};

export default Chat;
