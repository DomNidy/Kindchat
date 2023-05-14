"use client";
import "../styles/styles-chatroom.css";
import "../styles/styles.css";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

export default function Dashboard() {

  useEffect(() => {
    socket.emit("client-ready");

    socket.emit("in-dashboard", 'hey');
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 bg-blue-500 flex">
        <div className="w-44 flex-none">
          <Sidebar />
        </div>
        {/* The rest of the page content after the sidebar*/}
        <div className="flex-1 flex flex-col justify-between">
          <div className="bg-gray-900 fixed text-gray-400 w-full">Wisp</div>
          <div className="bg-gray-700 flex-1">
            <Chat socket={socket}/>
          </div>
        </div>
        <div className="bg-gray-800 w-36 flex-none">Left user bar</div>
      </div>
    </div>
  );
}
