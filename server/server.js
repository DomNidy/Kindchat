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
        console.log("Atempting to register user...")
        // Register in database
        let registerAttempt = await userController.registerUser(userCredentials.email, userCredentials.password);

        // If the register attempt fails (user already has an account)
        if (registerAttempt[0] === false) {
            console.log(registerAttempt[1]);
            res.statusMessage = registerAttempt[1];
            res.status(400).end();
            return;
        }

        // Generate session token for new user
        const sessionToken = await userController.generateSessionToken(userCredentials.email);
        console.log(`${userCredentials.email} has successfully registered, generated a new sessionToken: ${sessionToken}`);

        res.cookie('session', sessionToken);
        res.send(res.redirect('/chatroom'));
    }
    catch (err) {
        console.log("Catch in server.js", err);
    }
});

// Route handler for login endpoint
app.post('/login', async (req, res) => {
    try {
        console.log("Trying to login with: ", req.body);
        const userCredentials = ({
            email: req.body.email,
            password: req.body.password
        });
        // Try to login
        let loginAttempt = userController.loginUser(userCredentials.email, userCredentials.password);

        // If the login attempt was successful (matching credentials)
        if (await loginAttempt === true) {
            // Handle sessionToken generation / retrieval
            const sessionToken = await userController.generateSessionToken(userCredentials.email);
            console.log(`${userCredentials.email} has logged in, sessionToken: ${sessionToken}`);

            // Set session token cookie
            res.cookie('session', sessionToken);
            res.send(res.redirect('/chatroom'));

        }
        // If the login attempt failed (invalid credentials)
        else {
            res.statusMessage = await loginAttempt;
            res.status(400).end();
        }
    }
    catch (err) {
        console.log("Login error:", err);
    }
});

// Route handler for adding friends
app.post('/send-friend-request', async (req, res) => {
    try {
        let result = await userController.sendFriendRequest(req.body.accountToRequest, req.cookies.session);
        
    }
    catch (err) {
        console.log("Error adding friend");
    }
});
