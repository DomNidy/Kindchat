"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../styles/styles.css";
const logo = require("../logo.png");

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidState, setPasswordValidState] = useState({
    passwordErrorText: [""],
    fieldsValid: false,
  });

  // Destructure state so values can be accessed
  const { passwordErrorText, fieldsValid } = passwordValidState;

  useEffect(() => {
    validateFields();
  }, [password, confirmPassword, email]);

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
    } else if (id === "confirmPassword") {
      setConfirmPassword(value === " " ? "" : value);
    }
  };

  // Validates password & email format
  const validateFields = () => {
    if (!password && !email) {
      return;
    }
    // Conditions that must be met
    const emailValidFormat =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const isLongEnough = password.length >= 8;
    const confirmationFieldMatches = password === confirmPassword;

    // Dictionairy of error messages
    const conditionsDict = {
      emailValidFormat: "Email is not valid.",
      hasUpper: "Password needs a capital letter.",
      hasLower: "Password needs a lowercase letter.",
      hasDigit: "Password needs a digit. (0-9)",
      isLongEnough: "Password must be at least 8 characters long",
      confirmationFieldMatches:
        "Password & confirm password fields do not match.",
    };

    const errors = Object.entries({
      emailValidFormat,
      hasUpper,
      hasLower,
      hasDigit,
      isLongEnough,
      confirmationFieldMatches,
    }).reduce((acc, [err, value]) => {
      if (!value) {
        acc.push(conditionsDict[err]);
      }
      return acc;
    }, []);

    if (errors.length >= 1 || !emailValidFormat) {
      setPasswordValidState({
        passwordErrorText: errors,
        fieldsValid: false,
      });
    } else {
      setPasswordValidState({
        passwordErrorText: ["✔️"],
        fieldsValid: true,
      });
    }
  };

  // Sends the request to register user
  const clientRegister = () => {
    if (!fieldsValid) {
      return;
    }
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Registered successfully!", response);
          router.push("/dashboard");
        } else {
          console.log("Error registering user: ", response.statusText);
          setPasswordValidState({
            passwordErrorText: response.statusText,
            fieldsValid: false,
          });
        }
      })
      .catch((error) => {
        console.log("Error registering user", error);
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
      <input
        type="text"
        className="register-input-field"
        id="confirmPassword"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={handleInputChange}
      />
      <button
        className="register-button"
        id="register-button"
        onClick={clientRegister}
      >
        <p>Register</p>
      </button>

      <a href="/login" className="already-have-text">
        Already have an account? Log in.
      </a>

      <a>
        {passwordErrorText.map((error) => {
          return <p id="password-error">{error}</p>;
        })}
      </a>
    </div>
  );
};

export default Register;
