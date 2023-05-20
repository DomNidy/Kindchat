require("dotenv").config();
const { isValidSessionToken } = require("./userController");
const { dbName, clientDefault } = require("./database.js");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

    const insertMessageResult = await channelsCollection.updateOne(
      { ucid: ucid },
      {
        $push: {
          chat_history: {
            // Push message object here
            messageContent: message.messageContent,
            sender_uuid: message.sender_uuid,
            timestamp: message.timestamp,
          },
        },
      }
    );

    // If message was sent successfully, return true
    if (insertMessageResult.acknowledged == true) {
      return true;
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

module.exports = {
  grantChannelAccess,
  sendMessageInChannel,
};
