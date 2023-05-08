"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import "../styles/styles.css";
import "../styles/styles-chatroom.css";
const logo = require("../logo.png");

export default function Dashboard() {
  const incomingFriendRequests = {};

  function handleInput(event) {
    const { id, value } = event.target;
  }

  const sendFriendRequest = async (key) => {
    if (key.code != "Enter") {
      return;
    }
    const accountToRequest = key.target.value;
    const uuid = Cookies.get("uuid");
    
    if (uuid != undefined & accountToRequest != '') {
      console.log('sending reuqest');
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

  return (
    <>
      <div className="container-side-bar">
        <div className="logobox">
          <h1>Wisp</h1>
          <Image src={logo} alt="logo" />
        </div>

        <div className="container-open-chat-box" id="container-open-chat-box">
          <input
            className="find-friends-input"
            id="find-friends-input"
            type="text"
            placeholder="Find friends..."
            onKeyUp={sendFriendRequest}
          />

          <div id="container-incoming-friend-requests"></div>
        </div>

        <div className="container-side-bar-bottom">
          <p id="logged-in-as-text">Logged in as user</p>
          <button>Log out</button>
        </div>
      </div>
      <div className="container-chat">
        <div className="container-user-bar">
          <h3>Conversation with Anne</h3>
        </div>
        <div className="message-box message-box-sender">
          <p>Hello, how are you?</p>
        </div>
        <div className="message-box message-box-receive">
          <p>I'm good, how are you?</p>
        </div>
        <p className="timestamp">4/18/2023 5:45 PM</p>
        <div className="message-box message-box-sender">
          <p>
            Great! I had a super interesting day today, I can't wait to tell you
            all about it. Do you have time to call?
          </p>
        </div>
        <div className="message-box message-box-receive">
          <p>Sure! Gimme a second I have to finish walking the dog.</p>
        </div>
      </div>

      <div className="chat-input-field">
        <input
          type="text"
          placeholder="Send a message..."
          id="chat-input"
          className="register-input-field"
        />
      </div>
    </>
  );
}
