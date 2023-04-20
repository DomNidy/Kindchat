const userController = require('./userController')

const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')
const app = express();
const port = 8000;


app.use(express.static(path.join(__dirname, '..')), bodyParser.json());


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/chatroom', async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'chatroom.html'));
});


// Defines route handler for register endpoint
app.post('/register', async (req, res) => {
    try {
        console.log(req.body);
        const user = ({
            email: req.body.email,
            password: req.body.password
        });
        console.log("Registering user...")
        // Register in database
        await userController.registerUser(user.email, user.password);
    }
    catch (err) {
        console.log("Catch in server.js", err);
    }
});






