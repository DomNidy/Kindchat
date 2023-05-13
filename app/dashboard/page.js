"use client";
import "../styles/styles-chatroom.css";
import "../styles/styles.css";
import Cookies from "js-cookie";
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 bg-blue-500 flex">
        <div className="w-44 flex-none">
          <Sidebar />
        </div>
        {/* The rest of the page content after the sidebar*/}
        <div className="flex-1 flex flex-col justify-between">
          <div className="bg-gray-900 fixed text-gray-400 w-full">
            Wisp
          </div>
          <div className="bg-gray-700 flex-1">
            <Chat />
          </div>
          
        </div>
        <div className="bg-gray-800 w-36 flex-none">Left user bar</div>
      </div>
    </div>
  );
}
