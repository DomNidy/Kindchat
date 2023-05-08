"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../styles/styles.css";
const logo = require("../logo.png");

export default function Login(params) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const router = useRouter();

  // Updates state of input fields
  const handleInputChange = (event) => {
    const { id, value } = event.target;
    // Deny whitespaces
    if (/^(?=.*\s).{2,}$/.test(value)) {
      return;
    }
    if (id === "email") {
      setEmail(value);
    } else if (id === "password") {
      setPassword(value === " " ? "" : value);
    }
  };

  const clientLogin = () => {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/html",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          // REDIRECT HERE
          router.push("/dashboard");
        }
        setPasswordErrorText(response.statusText);
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  };

  return (
    <div className="container">
      <Image
        src={logo}
        priority={true}
        width="128"
        height="128"
        className="wisp-logo"
        alt="Wisp Logo"
      />
      <h1>Wisp</h1>
      <input
        type="text"
        className="register-input-field"
        id="email"
        placeholder="Email"
        value={email}
        onChange={handleInputChange}
      />
      <input
        type="text"
        className="register-input-field"
        id="password"
        placeholder="Password"
        value={password}
        onChange={handleInputChange}
      />
      <button
        className="register-button"
        id="register-button"
        onClick={clientLogin}
      >
        <p>Login</p>
      </button>

      <a href="/register" className="already-have-text">
        {" "}
        Already have an account? Register.
      </a>

      <p id="password-error">
        {passwordErrorText.length > 0 ? <a>{passwordErrorText}</a> : <a></a>}
      </p>
    </div>
  );
}
