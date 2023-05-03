const userController = require('./userController');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.json())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..')));

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('/register', async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'register.html'));
});

app.get('/chatroom', async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'chatroom.html'));
});


// Route handler for register endpoint
app.post('/register', async (req, res) => {
    try {
        console.log("Trying to register with: ", req.body);
        const userCredentials = ({
            email: req.body.email,
            password: req.body.password
        });

        // Register in database
        let registerAttempt = await userController.registerUser(userCredentials.email, userCredentials.password);

        // If the register attempt fails (user already has an account)
        if (registerAttempt.success === false) {
            console.log(registerAttempt.message);
            res.statusMessage = registerAttempt.message;
            res.status(400).end();
            return;
        }

        // Generate session token for new user
        const sessionToken = await userController.generateSessionToken(registerAttempt.uuid);
        console.log(`${userCredentials.email} has successfully registered, generated a new sessionToken: ${sessionToken}`);

        res.cookie('sessionToken', sessionToken);
        res.cookie('uuid', registerAttempt.uuid);
        res.send(res.redirect('/chatroom'));
    }
    catch (err) {
        console.log("Catch in server.js", err);
    }
});

// Route handler for login endpoint
app.post('/login', async (req, res) => {
    try {
        const userCredentials = ({
            email: req.body.email,
            password: req.body.password
        });

        console.log(`${userCredentials.email} is trying to login...`);
        // Try to login
        let loginAttempt = await userController.loginUser(userCredentials.email, userCredentials.password);

        // If the login attempt was successful (matching credentials)
        if (loginAttempt.success === true) {
            // Handle sessionToken generation / retrieval
            const sessionToken = await userController.generateSessionToken(loginAttempt.uuid);
            console.log(`${userCredentials.email} has logged in, sessionToken: ${sessionToken.tokenID}`);

            // Set cookies
            res.cookie('sessionToken', sessionToken, {
                expires: new Date(sessionToken.expires),
                httpOnly: true
            });

            res.cookie('uuid', loginAttempt.uuid);
            res.send(res.redirect('/chatroom'));

        }
        // If the login attempt failed (invalid credentials)
        else {
            res.statusMessage = loginAttempt;
            res.status(400).end();
        }
    }
    catch (err) {
        console.log("Login error:", err);
    }
});

// Route handler for adding friends
app.post('/friend-requests', async (req, res) => {
    try {
        let result = await userController.sendFriendRequest(req.body.uuid, req.body.accountToRequest, req.cookies.sessionToken);

        if (result === true) {
            // Friend request sent successfully
            res.status(200).end();
        }
        else {
            // Failed to send friend request
            res.status(400).end();
        }
    }
    catch (err) {
        console.log("Error adding friend");
    }
});

// Returns list of uuids which represent users that have sent a friend request to the requester's uuid {[uuid0, uuid1, uuid2…]}
app.get('/friend-requests/:uuid', async (req, res) => {
    try {
        const uuid = req.params.uuid;
        const sessionToken = req.cookies.sessionToken;

        // Get incoming friend requests for uuid
        const incomingRequests = await userController.getIncomingFriendRequests(uuid, sessionToken);

        // If the user does not have any incoming friend requests
        if (incomingRequests == false) {
            res.send([]);
            res.status(200).end();
            return;
        }

        // If the user has incoming friend requests
        res.send(incomingRequests);
        res.status(200).end();
    }
    catch (err) {
        console.log(err);
    }
});

// Accepts a friend request sent from uuid (if one exists)
// If the sender_uuid parameter is present in the incomingFriendRequests array of recipient_uuid, remove it from that array.
// And if recipient_uuid is present in the outgoingFriendRequests array of sender_uuid, remove it from that array.
// If both conditions are fulfilled the friend request is successful and the users should be added to eachothers friends list
app.put('/friend-requests/accept/:sender_uuid', async (req, res) => {
    try {
        const sender_uuid = req.params.sender_uuid;
        const recipient_uuid = req.body.recipient_uuid;
        const sessionToken = req.cookies.sessionToken;

        const result = await userController.acceptFriendRequest(recipient_uuid, sender_uuid, sessionToken);

        if (!result) {
            res.status(400).send('Failed to accept friend request');
            return;
        }
        else {
            res.status(200).send('Friend request accepted successfully');
        }
    }
    catch (err) {
        res.status(500).send('An error occurred while accepting the friend request');
        console.log(err);
    }
});

// If the user has a friend request incoming from the sender_uuid, decline it
app.put('/friend-requests/decline/:sender_uuid', async (req, res) => {
    try {
        console.log('tryin');
        const sender_uuid = req.params.sender_uuid;
        const recipient_uuid = req.body.recipient_uuid;
        const sessionToken = req.cookies.sessionToken;

        const result = await userController.declineFriendRequest(recipient_uuid, sender_uuid, sessionToken);
    }
    catch (err) {
        console.log(err);
    }
});

// Gets an array of the users friends
// Th structure of friends should be the following
//    {
//        uuid: friend.uuid,
//        displayName: friend.email
//    }
app.get(`/friends`, async (req, res) => {
    try {
        const uuid = req.cookies.uuid;
        const sessionToken = req.cookies.sessionToken;

        const friendsListObject = await userController.getFriendsList(uuid, sessionToken);

        if (!friendsListObject) {
            res.status(404).send([]);
        }
        else {
            res.status(200).send(friendsListObject);
        }
    }
    catch (err) {
        res.status(500).send('An error occurred while trying to get the friends list.');
        console.log(err);
    }
});
