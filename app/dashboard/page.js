"use client";
import "../styles/styles-chatroom.css";
import "../styles/styles.css";
import Cookies from "js-cookie";
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";


export default function Dashboard() {

  return (
    <div className="bg-gray-700 w-full min-h-screen flex justify-center">
      <Sidebar />
      <Chat />
    </div>
  );
}
