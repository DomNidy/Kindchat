require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
const dbName = "ChatAppDb";

// This stores the active clients each user is using
const cachedClients = {};


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const clientDefault = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// If the user has no active client in cachedClients, create a new client, insert it into cachedClients, then return the reference to the client and db
async function getClientAndDB(email) {
    if (!cachedClients[email]) {
        const client = await clientDefault.connect();
        const db = client.db(dbName);

        cachedClients[email] = { client, db };
    }

    return cachedClients[email];
}

// Becaus

// Closes the users active client 
async function closeClient(email) {
    if (cachedClients[email]) {

        delete cachedClients.email;
    }
}



module.exports = {
    getClientAndDB,
    dbName,
};



