"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// fromClient (bool): if true this means it is a message we sent and this message object came directly from our client,
// in that case, if the message sender is also our uuid, we SHOULD render it out. This gives the user instant feedback
const MessageBubble = ({
  messageContent,
  sender,
  displayName,
  timestamp,
  fromClient,
}) => {
  const uuid = Cookies.get("uuid");
  const timestampString = new Date(timestamp).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  // These conditionals ensure we dont render duplicate sessionMessages from the client
  // The way our websocket is setup causes the person who sent the message to also receieve a websocket event when their message is delivered to the websocket server
  // sessionMessages created by the client have a prop 'fromClient' to indicate that a message was not from the server
  // We do this because otherwise the sender of the message would see the delay between them sending their message and its actual delivery
  if (
    (sender == uuid && fromClient) ||
    sender != uuid ||
    fromClient === undefined
  ) {
    return (
      <div className="bg-gray-600 rounded-xl p-1">
        <div className="flex flex-row gap-4">
          <p className="text-md align-text-top font-semibold">
            {sender} {displayName}
          </p>
          <p className="font-normal text-sm text-gray-400">{timestampString}</p>
        </div>

        <p className="text-md">{messageContent}</p>
      </div>
    );
  }
};

const Chat = ({
  ucid,
  sessionMessages,
  setSessionMessages,
  databaseMessages,
  setDatabaseMessages,
}) => {
  // Object that contains information about chatters within this channel
  // We use this because upon retrieving sessionMessages from the database we only have the uuid of the person who sent a message
  // Once we fetch data from the uuid of each chatter in this chat room, we store it in this chatterInfo object, the key is the uuid of a particular user
  const [chatterInfo, setChatterInfo] = useState({});
  const uuid = Cookies.get("uuid");

  const handleChatInput = async (event) => {
    // If the user tries to send an empty message, we will exit the function
    if (event.target.value == "") {
      return;
    }

    // If the user hits enter, and the ucid is not undefined

    if (event.key === "Enter" && ucid != undefined) {
      // Insert message into sessionMessages array for instant feedback
      setSessionMessages((past) => {
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
      }).then(async (response) => {
        // If the api request was successful, emit a websocket event so the other user can immediately view this message
        if (response.ok) {
          const messageId = await response.json();
          // We will insert an entry with the message id to make it known that this messageId was already rendered by the socket, and thus we are fetching a duplicate message
          // This is because database messages without the required properties of (messageContent, timestamp, ucid, etc...) do not get rendered
          setDatabaseMessages((past) => {
            if (!past) {
              return { [messageId]: "Handled in session messages" };
            } else {
              const updatedMessages = past;
              updatedMessages[messageId] = "handled in session messages";
              return past;
            }
          });
          socket.emit("message", {
            messageContent: event.target.value,
            sender: uuid,
            ucid: ucid,
          });
        }
      });
    }
  };

  // Retrieve past messages from channel
  useEffect(() => {
    if (ucid == undefined) {
      console.log(
        "Ucid is undefined, we will not fetch messages. Open a chat channel to fetch messages."
      );

      return;
    }

    console.log(`Retrieving messages for ${ucid}...`);
    // Return value of this function is every unique uuuid from the list of retrieved messages
    async function getDatabaseMessages() {
      const result = await fetch(`/api/messages/${ucid}/50`, {
        method: "GET",
      }).then(async (response) => {
        // Convert response to json object
        const responseJson = await response.json();

        // Insert these messages into messages state
        setDatabaseMessages((past) => {
          const updatedMessages = { ...past }; // Create a new copy of the state

          responseJson.result.forEach((message) => {
            // Make sure the message id does not exist inside of sessionMessages, this will cause message duplicates to be rendered
            if (message.messageId && !updatedMessages[message.messageId]) {
              updatedMessages[message.messageId] = message;
            }
          });

          return updatedMessages; // Return the updated state
        });

        // Find unique users within the messages retrieved
        const uuidsArray = responseJson.result.map((msg) => msg.sender_uuid);

        const uniqueUuids = new Set(uuidsArray);

        return [...uniqueUuids];
      });
      return result;
    }

    // Fetch messages, then fetch user display names, set chatter info with user display names when retrieved
    getDatabaseMessages().then((uniqueUuids) => {
      uniqueUuids.forEach(async (uuid) => {
        if (!chatterInfo[uuid]) {
          try {
            const response = await fetch(`/api/users`, {
              method: "GET",
              headers: {
                uuid: uuid,
              },
            });
            const userData = await response.json();

            setChatterInfo((past) => {
              past[uuid] = { displayName: userData.displayName };
              return past;
            });
          } catch (error) {
            console.log(`Error fetching user data for UUID ${uuid}:`, error);
          }
        }
      });
    });

    console.log("messages: ", sessionMessages);
  }, [ucid]);

  return (
    <div className="flex flex-col w-full h-full max-h-screen">
      <div className="h-full overflow-y-auto text-xl text-gray-300 scrollbar-thin scrollbar-thumb-gray-400 ">
        {/* sessionMessages will be displayed in this flex col box*/
        /* Only sessionMessages that were sent from the current ucid will be displayed*/}
        <div className="flex flex-col m-4 gap-2 mt-24">
          

          {Object.values(databaseMessages).map((message, idx, array) =>
            message?.ucid === ucid ? (
              <MessageBubble
                messageContent={message?.messageContent}
                sender={chatterInfo[message?.sender_uuid]?.displayName}
                timestamp={message?.timestamp}
                fromClient={false}
                key={idx + sessionMessages.length}
              />
            ) : (
              <React.Fragment
                key={idx + sessionMessages.length}
              ></React.Fragment>
            )
          )}

          {sessionMessages.length >= 1 ? (
            sessionMessages.map((message, idx, array) =>
              message.ucid === ucid &&
              chatterInfo[message.sender_uuid]?.displayName ? (
                <MessageBubble
                  messageContent={message.messageContent}
                  sender={chatterInfo[message.sender_uuid].displayName}
                  timestamp={message.timestamp}
                  fromClient={message?.fromClient}
                  key={idx}
                />
              ) : (
                <React.Fragment key={idx}></React.Fragment>
              )
            )
          ) : (
            <>
              <p>No message history...</p>
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
