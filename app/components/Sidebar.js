"use client";
const logo = require("../logo.png");
import Image from "next/image";
import DropdownMenu from "./DropdownMenu";
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

function FriendIcon({ name, lastMessage }) {
  return (
    <div className="group w-20 h-20 bg-blue-100 rounded-full shadow-sm duration-300 hover:bg-blue-300 cursor-pointer">
      <div
        className="ml-[6.4rem] mt-[28%]  p-1 max-w-xs bg-gray-900 rounded-xl opacity-0 inline-block overflow-hidden 
      scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-75"
      >
        <p className="text-left font-bold text-gray-100 whitespace-nowrap">
          {name}
        </p>
        <p className="m-0 p-0 text-left text-gray-200 text-sm font-semibold italic whitespace-nowrap">
          {lastMessage}
        </p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [friendsList, setFriendsList] = useState([]);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => setDisplayName(Cookies.get("displayName")));

  const loadFriendsList = () => {
    const uuid = Cookies.get("uuid");
    const sessionToken = Cookies.get("sessionToken");

    if (uuid != undefined && sessionToken != undefined) {
      fetch(`/api/friends/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        if (response.ok) {
          setFriendsList(await response.json());
        }
      });
    }
  };

  useEffect(loadFriendsList, []);

  return (
    <div className="fixed top-0 left-0 h-screen w-32 m-0 flex flex-col shadow-lg bg-gray-800">
      <div className="relative top-0 left-0 h-max m-0 p-0 bg-gray-900">
        <Image
          src={logo}
          alt="wisp logo"
          className="drop-shadow-md grayscale hover:cursor-pointer duration-75 hover:grayscale-0"
        />
      </div>
      <DropdownMenu loadFriendsList={loadFriendsList} />
      <div className="mt-3 grid grid-cols-1 gap-3 place-content-start place-items-center h-full">
        {friendsList.map((friend, i) => (
          <FriendIcon key={i} name={friend.displayName} />
        ))}
      </div>
      <div className="bg-gray-900 h-11 flex flex-col justify-center">
        <p className="font-semibold text-md text-gray-200 text-ellipsis whitespace-nowrap overflow-hidden">
          {displayName}
        </p>
      </div>
    </div>
  );
}
