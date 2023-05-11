"use client";
const logo = require("../logo.png");
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { IoIosArrowDropdown } from "react-icons/io";

function FriendIcon({ name, lastMessage }) {
  return (
    <div className="group w-2/3 h-16 bg-blue-100 rounded-full shadow-sm duration-300 hover:bg-blue-300  cursor-pointer ">
      <div
        className="ml-[5.2rem] mt-3 p-1 max-w-xs bg-blue-950 rounded-xl opacity-0 inline-block overflow-hidden 
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

function IncomingFriendRequestIcon({ name }) {
  <div className="w-2/3 h-16 bg-blue-100 rounded-full shadow-sm">
    <p>{name}</p>
  </div>;
}

function DropdownMenu() {
  const [open, setOpen] = useState(false);
  const [findFriendsFocused, setFindFriendsFocused] = useState(false);
  const [findFriendsText, setFindFriendsText] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  async function sendFriendRequest(nameToSendRequestTo) {
    // Update so user cant edit the input field while we send the request
    setIsSendingRequest(true);
    setFindFriendsText("...");

    await fetch(`/api/friend-requests/${nameToSendRequestTo}`, {
      method: "POST",
    });

    setIsSendingRequest(false);
    setFindFriendsText("");
  }

  function handleFriendRequestInput(e) {
    console.log(e);
    if (e.key === "Enter") {
      // Send friend request through api
      console.log("sending request to", e.target.value);
      sendFriendRequest(e.target.value);
    }
  }

  return (
    <div className="group bg-blue-600 w-full flex m-0 justify-center items-center ">
      {open ? (
        /* Displayed if dropdown menu is open */
        <div className="flex flex-col items-center w-full cursor-default">
          <div className="w-full p-0 m-0" onClick={() => setOpen(!open)}>
            <IoIosArrowDropdown className="mt-1 w-full p-0 hover:invert cursor-pointer" />
          </div>
          <input
            className="h-7 mt-1 w-full bg-blue-50 rounded-md hover:drop-shadow-md text-center text-sm outline-none"
            placeholder="Find friends"
            value={findFriendsText}
            onKeyUp={(e) => handleFriendRequestInput(e)}
            onChange={(e) => setFindFriendsText(e.target.value)}
            onFocus={() => setFindFriendsFocused(!findFriendsFocused)}
            disabled={isSendingRequest}
          ></input>
          <p>Dropdown Content here!</p>
        </div>
      ) : (
        /* Displayed if dropdown menu is closed */
        <div
          className="flex w-full m-0 justify-center cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <IoIosArrowDropdown className="m-1 group-hover:invert" />
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [incomingFriendRequests, setIncomingFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);

  const loadIncomingFriendRequests = () => {
    const uuid = Cookies.get("uuid");
    const sessionToken = Cookies.get("sessionToken");
    if (uuid != undefined && sessionToken != undefined) {
      fetch(`/api/friend-requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        response.json().then((responseJson) => {
          setIncomingFriendRequests(responseJson);
        });
      });
    }
  };

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
        setFriendsList(await response.json());
      });
    }
  };

  useEffect(loadIncomingFriendRequests, []);
  useEffect(loadFriendsList, []);

  return (
    <div className="fixed top-0 left-0 h-screen w-28 m-0 flex flex-col shadow-lg bg-blue-800">
      <div className="relative top-0 left-0 h-max m-0 p-0 bg-blue-500">
        <Image src={logo} alt="wisp logo" className="drop-shadow-md" />
      </div>
      <DropdownMenu />
      <div className="mt-3 grid grid-cols-1 gap-3 place-content-start place-items-center h-full">
        {friendsList.map((friend, i) => (
          <FriendIcon key={i} name={friend.displayName} />
        ))}
      </div>
    </div>
  );
}
