require("dotenv").config();
const { dbName, clientDefault } = require("./database.js");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// When the user requests content needing a session token, this function will ensure their session token is valid & has not expired
async function isValidSessionToken(token, uuid) {
  // Get client
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  const db = client.db(dbName);
  try {
    console.log("Verifying token:", token);
    if (!token) {
      console.log("Token is undefined");
      return false;
    }
    if (!uuid) {
      console.log("uuid is undefined");
      return false;
    }

    // Get sessions collection
    const sessionsCollection = await db.collection("sessions");

    // Attempt to find the tokenID in the collection
    const tokenResult = await sessionsCollection.findOne({
      tokenID: token,
      uuid: uuid,
    });

    // If the tokenID & uuid combination does not exist in the database, return false
    if (!tokenResult) {
      console.log(`${tokenResult.tokenID} with user ${uuid} does not exist`);
      return false;
    }

    // If the tokens expiry time is greater than the current time, return true, if not, return false
    if (tokenResult.expires > Date.now()) {
      return true;
    }
    console.log(`${tokenResult} is expired.`);
    return false;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}
async function grantChannelAccess(ucid, participant_uuids) {
  // Get client
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  const db = client.db(dbName);
  try {
    const usersCollection = db.collection("users");

    // Give each partcipant access to channel with the ucid provided
    await participant_uuids.map(async (participant_uuid) => {
      console.log(`Granting channel access for ${participant_uuid}`);
      let updateResult = await usersCollection.updateOne(
        { uuid: participant_uuid },
        {
          $push: {
            channel_access: {
              ucid: ucid,
            },
          },
        }
      );
      console.log(`Update result for ${participant_uuid} is, ${updateResult}`);
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function sendMessageInChannel(uuid, sessionToken, ucid, message) {
  // Get client
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  const db = client.db(dbName);
  try {
    if (!(await isValidSessionToken(sessionToken, uuid))) {
      return false;
    }

    const channelsCollection = db.collection("channels");
    const generatedMessageID = crypto.randomUUID();

    const insertMessageResult = await channelsCollection.updateOne(
      { ucid: ucid },
      {
        $push: {
          chat_history: {
            // Push message object here
            messageContent: message.messageContent,
            sender_uuid: message.sender_uuid,
            timestamp: message.timestamp,
            messageId: generatedMessageID,
            ucid: ucid,
          },
        },
      }
    );

    // If message was sent successfully, return generatedMessageID
    if (insertMessageResult.acknowledged == true) {
      return generatedMessageID;
    }
    // If message could not be send for any reason, return false
    // Additional information on the updateOne response can be found in the insertMessageResult object
    return false;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getMessagesInChannel(uuid, sessionToken, ucid, limit) {
  // Get client
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  const db = client.db(dbName);
  try {
    console.log(uuid, sessionToken, ucid, limit);

    if (!(await isValidSessionToken(sessionToken, uuid))) {
      return false;
    }

    const channelsCollection = db.collection("channels");

    const retrievedMessages = await channelsCollection.findOne({ ucid: ucid });

    if (retrievedMessages) {
      return retrievedMessages.chat_history.slice(-limit);
    }
    if (!retrievedMessages) {
      return false;
    }

    return false;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

module.exports = {
  grantChannelAccess,
  sendMessageInChannel,
  getMessagesInChannel,
};
