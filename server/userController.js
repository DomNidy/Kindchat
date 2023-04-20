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
        console.log("Dbname:", dbName);
        const db = client.db(dbName);

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
    } catch(err) {
        console.log("Error registering user:", err);
    } finally {
        // If client exists, close it
        if(client) {
            client.close();
        }
    }
}

module.exports = { registerUser };