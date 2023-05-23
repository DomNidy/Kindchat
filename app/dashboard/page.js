"use client";
import "../styles/styles-chatroom.css";
import "../styles/styles.css";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

export default function Dashboard() {
  // ucid of chat channel that is currently active
  const [currentChat, setCurrentChat] = useState();
  // Display name of user we are chatting with
  const [topbarDisplayName, setTopbarDisplayName] =
    useState("No chat opened...");
  // This is an array used to store messages retrieved from the websocket
  const [sessionMessages, setSessionMessages] = useState([]);
  // This is an object used to store messages retrieved from the database
  const [databaseMessages, setDatabaseMessages] = useState({});
  // This is an array of all ucids the user has access to, we should join all of these rooms when they finish loading
  const [channelAccess, setChannelAccess] = useState([]);

  // After the component is finished mounting, fetch the channelAccess from the api
  useEffect(() => {
    console.log("Fetching channel access...");

    fetch("/api/channels/get-channel-access", {
      method: "GET",
    }).then(async (response) => {
      if (response.ok) {
        setChannelAccess(await response.json());
      }
    });
  }, []);

  // After we retrieve channelAccess, join the rooms with a websocket
  useEffect(() => {
    if (channelAccess.length !== 0) {
      // Convert the [{ucid: actual_ucid}] format of channelAccess into an array containing only ucids
      let arrayOfUCIDS = channelAccess.map((obj) => obj.ucid);

      socket.emit("join-room", arrayOfUCIDS);
      console.log(socket);
    }
  }, [channelAccess]);

  // Add event listener for "message-received" event
  useEffect(() => {
    console.log("added listener");

    socket.on("message-received", (message) => {
      console.log("GOT MSG", message);
      // Handle received message
      setSessionMessages((past) => {
        if (past.length >= 1) {
          return [...past, message];
        }
        return [message];
      });
    });
    // Pass an empty array to only call the function once on mount.
  }, []);

  // Whenever we receieve a new message
  useEffect(() => {
    console.log("new msg");
  }, [sessionMessages]);

  // This function is passed as a prop to give the FriendIcon component inside Sidebar access to the state of Dashboard
  const updateCurrentChat = (newUcid) => {
    setCurrentChat(newUcid);
  };

  const updateTopbarDisplayName = (newName) => {
    setTopbarDisplayName(newName);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 bg-blue-500 flex">
        <div className="w-44 flex-none">
          <Sidebar
            updateCurrentChat={updateCurrentChat}
            updateTopbarDisplayName={updateTopbarDisplayName}
          />
        </div>
        {/* The rest of the page content after the sidebar*/}
        <div className="flex-1 flex flex-col justify-between">
          <div className="bg-gray-900 fixed text-gray-400 w-full">
            Wisp
            {!currentChat ? (
              <></>
            ) : (
              <div className="bg-gray-800 h-12 font-semibold text-xl text-gray-300 flex items-center">
                Chatting with {topbarDisplayName}
              </div>
            )}
          </div>

          <div className="bg-gray-700 flex-1">
            <Chat
              ucid={currentChat}
              sessionMessages={sessionMessages}
              setSessionMessages={setSessionMessages}
              databaseMessages={databaseMessages}
              setDatabaseMessages={setDatabaseMessages}
            />
          </div>
        </div>
        <div className="bg-gray-800 w-36 flex-none">Left user bar</div>
      </div>
    </div>
  );
}
