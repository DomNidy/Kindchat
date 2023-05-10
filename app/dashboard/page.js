"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import '../styles/styles-chatroom.css';
import "../styles/styles.css";


export default function Dashboard() {
  return (
    <>
      
      <div className="container-chat bg-white">
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
