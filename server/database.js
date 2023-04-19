require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        console.log("Successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}

async function insertMessage(uid, message) {
    try {
        // Connect client to server
        await client.connect();
        await client.db("ChatAppDb").collection("users").insertOne({ uid: `${uid}`, message: `${message}` });
    } finally {
        await client.close();
    }
}

insertMessage("123", "abc");

