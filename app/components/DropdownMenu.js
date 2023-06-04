"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import { AiOutlineCheckCircle } from "react-icons/ai";
import Cookies from "js-cookie";

function IncomingFriendRequestIcon({
  name,
  uuid,
  loadFriendsList,
  loadIncomingFriendRequests,
}) {
  const mainDiv = useRef(null);

  // TODO: Make it so upon accepting a friend request the user instantly has the request icon disappear from their UI and instantly renders in the sidebar by other friends
  // TODO: We can use conditional rendering & state for this. JUST get it done!!!!
  async function acceptFriendRequest() {
    mainDiv.current.className += "hidden";
    fetch(`/api/friend-requests/accept/${uuid}`, {
      method: "PUT",
    }).then(() => {
      loadFriendsList();
      loadIncomingFriendRequests();
    });
  }

  async function declineFriendRequest() {
    mainDiv.current.className += "hidden";
    fetch(`/api/friend-requests/decline/${uuid}`, {
      method: "PUT",
    }).then(() => {
      loadIncomingFriendRequests();
    });
  }

  return (
    <div
      className="group flex flex-col w-20 h-20 bg-gray-100 rounded-full shadow-sm duration-200 hover:w-10/12 hover:h-32 mt-1 mb-1"
      ref={mainDiv}
    >
      <p className="m-2 font-semibold text-center overflow-clip break-words">
        {name}
      </p>
      <div className="flex justify-center basis-1/3 items-center scale-0 group-hover:scale-100 duration-200 p-0 ">
        <AiOutlineCheckCircle
          className="scale-150 mr-6 hover:cursor-pointer hover:fill-green-800 transition-colors duration-150"
          onClick={acceptFriendRequest}
        />
        <MdOutlineCancel
          className="scale-150 hover:cursor-pointer hover:fill-red-800 transition-colors duration-150"
          onClick={declineFriendRequest}
        />
      </div>
    </div>
  );
}

export default function DropdownMenu(props) {
  const [open, setOpen] = useState(false);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState([]);
  const [findFriendsFocused, setFindFriendsFocused] = useState(false);
  const [findFriendsText, setFindFriendsText] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Add listener for friend requests
  useEffect(() => {
    // Add listener for when you receive a friend request
    props.socket.on(
      "friend-request-received",
      ({ sender_uuid, sender_name }) => {
        console.log("You got a friend request from", sender_uuid);

        // Open dropdown when friend request is received
        if (!open) {
          setOpen(!open);
        }

        // TODO: Render this friend request out, this is received from the websocket server
        const newReq = {
          sender_uuid: sender_uuid,
          sender_name: sender_name,
        };

        setIncomingFriendRequests((prev) => {
          if (prev.length > 0) {
            return [...prev, newReq];
          }
          return [newReq];
        });

        console.log("Received new new request", newReq);
      }
    );
  }, []);

  // Sends a friend request
  async function sendFriendRequest(nameToSendRequestTo) {
    // Update so user cant edit the input field while we send the request
    setIsSendingRequest(true);
    setFindFriendsText("...");
    const uuid = Cookies.get("uuid");

    const sendFriendRequestResult = await fetch(
      `/api/friend-requests/${nameToSendRequestTo}`,
      {
        method: "POST",
      }
    ).then(async (response) => {
      if (response.ok) {
        return await response.json();
      }
      return false;
    });

    // If we successfully send a friend request, emit the socket
    if (sendFriendRequestResult) {
      props.socket.emit("friend-request-sent", {
        recipient_uuid: sendFriendRequestResult.uuidRequested,
        sender_uuid: uuid,
      });
    }

    setIsSendingRequest(false);
    setFindFriendsText("");
  }

  function handleFriendRequestInput(e) {
    if (e.key === "Enter") {
      // Send friend request through api
      console.log("sending request to", e.target.value);
      sendFriendRequest(e.target.value);
    }
  }

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

  useEffect(loadIncomingFriendRequests, []);

  return (
    <div className="bg-gray-800 w-full flex m-0 justify-center items-center ">
      {open ? (
        /* Displayed if dropdown menu is open */
        <div className="flex flex-col items-center w-full cursor-default transition-all duration-75 bg-gray-900">
          <div className="w-full p-0 m-0" onClick={() => setOpen(!open)}>
            <IoIosArrowDropdown className="mt-1 w-full p-0 fill-slate-50 hover:fill-blue-300  cursor-pointer transition-all duration-100 rotate-0" />
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
          {incomingFriendRequests.length >= 1 ? (
            <p className="font-semibold text-md text-center text-gray-100 m-1">
              {incomingFriendRequests.length} Incoming friend requests!
            </p>
          ) : undefined}

          {incomingFriendRequests.map((friendRequest, i) => (
            <IncomingFriendRequestIcon
              key={i}
              name={friendRequest.sender_name}
              uuid={friendRequest.sender_uuid}
              loadFriendsList={props.loadFriendsList}
              loadIncomingFriendRequests={loadIncomingFriendRequests}
            />
          ))}
        </div>
      ) : (
        /* Displayed if dropdown menu is closed */
        <div
          className="flex w-full m-0 justify-center cursor-pointer bg-gray-900"
          onClick={() => setOpen(!open)}
        >
          <IoIosArrowDropdown className="mt-1 w-full p-0 fill-slate-50 hover:fill-blue-300 cursor-pointer transition-all duration-100 rotate-180" />
        </div>
      )}
    </div>
  );
}
