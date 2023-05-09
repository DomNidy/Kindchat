const logo = require("../logo.png");
import Image from "next/image";
import React, { useState, useEffect } from "react";
import styles from "../styles/styles-chatroom.css";
import Cookies from "js-cookie";
// Import dependant components
import IncomingFriendRequest from "./IncomingFriendRequest";

function FriendIcon({ name, lastMessage }) {
  return (
    <div className="group w-2/3 h-16 bg-blue-100 rounded-full hover:bg-blue-300 cursor-pointer ">
      <div className="ml-20 p-1 max-w-xs bg-blue-950 rounded-xl opacity-0 inline-block overflow-hidden group-hover:opacity-100 ">
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
  const [incomingFriendRequests, setIncomingFriendRequests] = useState([]);

  const loadIncomingFriendRequests = () => {
    const uuid = Cookies.get("uuid");
    if (uuid != undefined) {
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

  const sendFriendRequest = async (key) => {
    if (key.code != "Enter") {
      return;
    }
    const accountToRequest = key.target.value;
    const uuid = Cookies.get("uuid");

    if ((uuid != undefined) & (accountToRequest != "")) {
      fetch(`/api/friend-requests/${accountToRequest}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid: uuid,
        }),
      }).then((response) => {
        console.log(response);
      });
    }
  };

  useEffect(loadIncomingFriendRequests, []);

  return (
    <div className="fixed top-0 left-0 h-screen w-24 m-0 flex flex-col shadow-lg bg-blue-800">
      <div className="mt-3 grid grid-cols-1 gap-3 place-content-start place-items-center h-full">
        {incomingFriendRequests.map((friendRequest, i) => (
          <FriendIcon key={i} name={friendRequest.sender_name} />
        ))}
      </div>
    </div>
  );
}
