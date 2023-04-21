require('dotenv').config();
const bcrypt = require('bcrypt');
const { getClient, dbName } = require('./database.js')
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;

async function registerUser(email, password) {
    let client;
    try {
        // Get client
        client = getClient();
        // Connect client
        await client.connect().then(console.log('Client connected to DB'));

        // Get reference to db
        const db = client.db(dbName);

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user object
        const newUser = {
            email: email,
            password: hashedPassword
        };

        // Insert into users collection
        const result = await db.collection('users').insertOne(newUser);

        console.log('User registered successfully: ', result.insertedId);
        return result.insertedId;
    } catch (err) {
        console.log("Error registering user:", err);
    } finally {
        // If client exists, close it
        if (client) {
            client.close();
        }
    }
}

async function loginUser(email, password) {
    let client;
    try {
        // Get client
        client = getClient();
        // Connect client to db
        await client.connect();
        // Reference to db
        const db = client.db(dbName);
        // Reference to users collection
        const collection = db.collection('users');

        const user = await collection.findOne({ email: email });

        // If we find the email within the database
        if (user) {
            const result = await new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
            });

            if (result === true) {
                return true;
            }
            else {
                return `User ${email} has failed to login, wrong pass`;
            }
        }
        else {
            return `User ${email} does not exist!`;
        }

    } finally {
        if (client) {
            client.close();
        }
    }
}

module.exports = { registerUser, loginUser };