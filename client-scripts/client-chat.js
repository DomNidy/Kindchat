// Stores message history of conversation
const messageHistory = [];
const client = "me";

// Returns the cookie containing the current users UUID
function getCurrentUUIDCookie() {
    // Parse the uuid cookie
    const uuidPattern = /uuid=([\w-]+)/;
    const match = document.cookie.match(uuidPattern);

    if (match) return match[1];
    return false;
}

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

// Sends a friend request
function sendFriendRequest(event) {
    if (event.key == "Enter") {
        const inputFindFriends = document.getElementById("find-friends-input");

        // Parse the uuid cookie
        const uuid = getCurrentUUIDCookie();

        // If we find a uuid from the cookies, send the request
        if (uuid) {
            fetch('/friend-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uuid: uuid,
                    accountToRequest: inputFindFriends.value
                })
            }).then(response => {
                console.log(response);
            })
        }
    }
}



// Gets the incoming friend requests from the api
async function getIncomingFriendRequests() {
    const uuid = getCurrentUUIDCookie();

    if (uuid) {
        try {
            const response = await fetch(`/friend-requests/${uuid}`, {
                method: 'GET'
            });

            const incomingFriendRequestsArray = await response.json();
            return incomingFriendRequestsArray;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }
    else {
        throw new Error('No UUID found in cookies!');
    }
}

function createIncomingRequestElements(incomingFriendRequestsArray) {
    incomingFriendRequestsArray.map((element) => {
        createIncomingRequestElement(element);
    })
}

// Sender_uuid is the uuid of the person who sent us a friend request that we wish to accept
function acceptFriendRequest(sender_uuid, request_element) {
    // Parse the uuid cookie
    const uuid = getCurrentUUIDCookie();
    console.log(sender_uuid);

    if (uuid) {
        try {
            fetch(`/friend-requests/accept/${sender_uuid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    recipient_uuid: uuid,
                    sender_uuid: sender_uuid
                })
            })
                .then(request_element.remove());
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }
    else {
        throw new Error('No UUID found in cookies!');
    }
}

function createIncomingRequestElement(incomingFriendRequest) {
    // Create div container and add class for styling
    var friendRequestDiv = document.createElement("div");
    friendRequestDiv.classList.add("incoming-friend-request");

    var defaultText = document.createElement("p");
    defaultText.classList.add("incoming-friend-request-default-text")
    defaultText.textContent = "Incoming friend request from: ";

    // This is just used to store the uuid of the person who requested in the client side
    var hiddenUUIDText = document.createElement("p");
    hiddenUUIDText.classList.add("hide-text");
    hiddenUUIDText.textContent = incomingFriendRequest.sender_uuid;

    // Create element to show the user who sent the request
    var friendRequestName = document.createElement("p");
    friendRequestName.classList.add("incoming-friend-request-name")
    friendRequestName.textContent = `${incomingFriendRequest.sender_name}`;

    // Create button element to accept friend request
    var friendRequestAcceptButton = document.createElement("button");
    friendRequestAcceptButton.classList.add("incoming-friend-request-button", "incoming-friend-request-button-accept");
    friendRequestAcceptButton.textContent = "Accept";
    friendRequestAcceptButton.addEventListener("click", function () {
        acceptFriendRequest(hiddenUUIDText.textContent, friendRequestDiv);
    });

    // Create button element to decline friend request
    var friendRequestDeclineButton = document.createElement("button");
    friendRequestDeclineButton.classList.add("incoming-friend-request-button", "incoming-friend-request-button-decline");
    friendRequestDeclineButton.textContent = "Decline";

    // Create a container to put accept and decline buttons in
    var buttonContainer = document.createElement("div");
    buttonContainer.classList.add("incoming-friend-request-button-container");
    buttonContainer.append(friendRequestAcceptButton, friendRequestDeclineButton);

    // Add elements to the friendRequestDiv
    friendRequestDiv.append(
        defaultText,
        hiddenUUIDText,
        friendRequestName,
        buttonContainer
    );

    // Get the element with the id "container-incoming-friend-request"
    var acceptFriendRequestsElement = document.getElementById("container-incoming-friend-requests");
    // Append the div we created to the element with id "container-incoming-friend-requests"
    acceptFriendRequestsElement.appendChild(friendRequestDiv);
}

// Wait until all content is loaded to select elements
document.addEventListener("DOMContentLoaded", function () {
    getIncomingFriendRequests().then(incomingFriendRequestsArray => {
        createIncomingRequestElements(incomingFriendRequestsArray);
    });
    const inputElement = document.getElementById("chat-input");
    const inputFindFriends = document.getElementById("find-friends-input");

    inputElement.addEventListener("keydown", onMessageInputChanged);
    inputFindFriends.addEventListener("keyup", sendFriendRequest);
})