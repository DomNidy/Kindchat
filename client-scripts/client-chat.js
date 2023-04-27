// Stores message history of conversation
const messageHistory = [];
const client = "me";

function sendMessage(text) {
    const containerChat = document.querySelector(".container-chat");
    const sender = document.createElement("div");
    sender.classList.add("message-box", "message-box-sender");

    // Create <p> element and set its textContent to the message text
    const p = document.createElement("p");
    p.textContent = text;

    // If the last message was sent by another user, create a timestamp and insert it into the chat log
    let lastMessage = messageHistory[messageHistory.length - 1];
    if (lastMessage != client) {
        createTimestamp();
    }

    // Append the <p> element to the message-box-sender element
    sender.appendChild(p);
    // Append the message-box-sender element to container-chat element
    containerChat.appendChild(sender);
    // Tracks the message history, more specifically; the history of which users sent a message when
    // For messages sent by the client the value will always be "me", messages sent by other users will be their uid
    messageHistory.push(client)
}

function createTimestamp() {
    const containerChat = document.querySelector(".container-chat");
    const timestamp = document.createElement("p");
    timestamp.classList.add("timestamp");

    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let amPm = hour >= 12 ? "PM" : "AM";

    // Converty hour from 24-hour to 12-hour format
    if (hour > 12) {
        hour -= 12;
    }

    // Add leading zeroes to single-digit minutes
    if (minute < 10) {
        minute = '0' + minute;
    }

    let formattedDate = month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ' ' + amPm;
    timestamp.textContent = formattedDate;
    containerChat.appendChild(timestamp);
}

function onMessageInputChanged(event) {
    if (event.key == "Enter") {
        const inputElement = document.getElementById("chat-input");
        const message = inputElement.value;
        sendMessage(message);
        // Clear inputElement contents after sending message
        inputElement.value = "";
    }
}

// This is 
function addFriend(event) {
    if (event.key == "Enter") {
        const inputFindFriends = document.getElementById("find-friends-input");
        fetch('/send-friend-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountToRequest: inputFindFriends.value
            })
        }).then(response => {
            console.log(response);
        })
    }
}

// Wait until all content is loaded to select elements
document.addEventListener("DOMContentLoaded", function () {
    const inputElement = document.getElementById("chat-input");
    const inputFindFriends = document.getElementById("find-friends-input");

    inputElement.addEventListener("keydown", onMessageInputChanged);
    inputFindFriends.addEventListener("keyup", addFriend);
})