require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URI;
const dbName = "ChatAppDb";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const clientDefault = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

module.exports = {
  dbName,
  clientDefault,
};
