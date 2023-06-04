"use client";
const logo = require("../logo.png");
import Image from "next/image";
import DropdownMenu from "./DropdownMenu";
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import Cookies from "js-cookie";

const FriendIcon = (props) => {
  const [isVisible, setIsVisible] = useState(true);
  const our_uuid = Cookies.get("uuid");

  const removeFriend = async () => {
    setIsVisible(false);
    /// Emit socket event
    props.socket.emit("friend-removed", {
      remover_uuid: our_uuid,
      removed_uuid: props.uuid,
    });

    await fetch(`/api/friends/${props.uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      console.log(response);
    });
  };

  return (
    <div>
      {isVisible && (
        <div
          className="group w-20 h-20 bg-blue-100 rounded-full shadow-sm duration-300 hover:bg-blue-300 cursor-pointer"
          onClick={() => {
            props.updateCurrentChat(props.ucid);
            props.updateTopbarDisplayName(props.name);
          }}
        >
          <div
            className="ml-[6.4rem] mt-[28%]  p-1 max-w-xs bg-gray-900 rounded-xl opacity-0 inline-block overflow-hidden 
      scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-75"
          >
            <p className="text-left font-bold text-gray-100 whitespace-nowrap">
              {props.name}
            </p>
            <p className="m-0 p-0 text-left text-gray-200 text-sm font-semibold italic whitespace-nowrap">
              {props.lastMessage}
            </p>
          </div>
          {/* Placeholder remove friend button */}
          <button
            className="bg-red-500 rounded-full w-7 h-7 text-sm  hover:bg-red-800"
            onClick={removeFriend}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
};

const Sidebar = (props) => {
  const [friendsList, setFriendsList] = useState([]);
  const [displayName, setDisplayName] = useState("");
  useEffect(() => setDisplayName(Cookies.get("displayName")), []);

  useEffect(() => {
    // Add event listener for when a friend removes you
    props.socket.on("friend-removed-you", ({ remover_uuid }) => {
      console.log(`${remover_uuid} removed you!`);
      // TODO: Remove the friend that removed you from the friendsList
      setFriendsList((prev) => {
        if (prev) {
          prev.filter((friendObj) => {
            return friendObj.uuid !== remover_uuid;
          });
        }
      });
    });
  }, []);

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
    <div className="flex flex-col h-full w-44 m-0 fixed shadow-lg bg-gray-800">
      <div className="top-0 left-0 h-max m-0 p-0 bg-gray-900">
        <Image
          src={logo}
          alt="wisp logo"
          className="drop-shadow-md grayscale hover:cursor-pointer duration-75 hover:grayscale-0"
        />
      </div>
      <DropdownMenu loadFriendsList={loadFriendsList} socket={props.socket} />
      <div className="mt-3 grid grid-cols-1 gap-3 place-content-start place-items-center h-full">
        {friendsList &&
          friendsList.map((friend, i) => (
            <FriendIcon
              key={i}
              name={friend.displayName}
              uuid={friend.uuid}
              ucid={friend.ucid}
              updateCurrentChat={props.updateCurrentChat}
              updateTopbarDisplayName={props.updateTopbarDisplayName}
              socket={props.socket}
            />
          ))}
      </div>
      <div className="bg-gray-900 h-11 flex flex-col justify-center">
        <p className="font-semibold text-md text-gray-200 text-ellipsis whitespace-nowrap overflow-hidden">
          {displayName}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
