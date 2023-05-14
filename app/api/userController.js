require("dotenv").config();
const bcrypt = require("bcrypt");
const utility = require("./utility");
const chatController = require("./chatController");
const { dbName, clientDefault } = require("./database.js");
const { randomUUID, randomBytes } = require("crypto");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

async function registerUser(email, password) {
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
    if (!utility.validateEmailPasswordInput(email, password)) {
      console.log("Input did not complete all regex tests");
      return {
        success: false,
        message: "Invalid input format",
      };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check to see if account already exists
    const accountResult = await db
      .collection("users")
      .findOne({ email: email });
    if (accountResult != null) {
      return {
        success: false,
        message: `${email} already has an account`,
      };
    }

    // Create user object
    const newUser = {
      uuid: randomUUID(),
      email: email,
      password: hashedPassword,
      displayName: email,
    };

    // Insert into users collection
    const result = await db.collection("users").insertOne(newUser);

    console.log("User registered successfully: ", result.insertedId);
    return {
      success: true,
      uuid: newUser.uuid,
    };
  } catch (err) {
    console.log("Error registering user:", err);
  } finally {
    // If client exists, close it
    if (client) {
      console.log("Closing client");
      await client.close();
    }
  }
}

async function loginUser(email, password) {
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
    if (!utility.validateEmailPasswordInput(email, password)) {
      console.log("Input did not complete all regex tests");
      return {
        success: false,
        message: "Invalid input format",
      };
    }

    // Reference to users collection
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: email });

    // If we find the email within the database
    if (user) {
      const result = await new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      if (result === true) {
        const uuid = await user.uuid;
        return {
          success: true,
          uuid: uuid,
        };
      } else {
        return {
          success: false,
          message: `Failed to login, wrong password!`,
        };
      }
    } else {
      return {
        success: false,
        message: `User ${email} does not exist!`,
      };
    }
  } finally {
    if (client) {
      console.log("Closing client");
      await client.close();
    }
  }
}

// Generates a session Token and then creates and inserts a sessionToken object on the database
async function generateSessionToken(uuid) {
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
    // Get past tokens the user that are still stored in the db
    const needsNewToken = await retrieveUserPastSessionTokens(uuid).then(
      async (pastTokens) => {
        // If we have past tokens to check for expired and duplicates
        if (pastTokens !== false) {
          return await removeExpiredAndDuplicateTokens(pastTokens, uuid);
        }
        return true;
      }
    );

    // If needsNewToken is explicity NOT equal to true before type-conversion comparisson is done
    // We do this because needsNewToken can either be true or the active session token
    // If we were to do only "if(needsNewToken == true)" this condition would always run by default since the session token string would evaluate to true

    if (needsNewToken !== true) {
      console.log(`User ${uuid} already has an active session token`);
      return needsNewToken;
    } else {
      console.log(`User ${uuid} needs a new session token, generating one...`);

      // Reference to sessions collection
      const sessionsCollection = db.collection("sessions");

      // Generates the actual uuid assosciated with the sessionToken (the string of numbers and letters)
      const tokenID = randomUUID();
      // Token expires 18000000 miliseconds from now (5 hours)
      const expirationTime = Date.now() + 18000000;
      // Create sessionToken object to be inserted in database
      const sessionToken = {
        uuid: uuid,
        tokenID: tokenID,
        expires: expirationTime,
      };
      const insertResult = await sessionsCollection.insertOne(sessionToken);
      console.log("Inserted a session token:", insertResult);
      return {
        tokenID: tokenID,
        expires: expirationTime,
      };
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (client) {
      console.log("Closing client");
      await client.close();
    }
  }
}

// Checks database to see if the user has multiple tokens already
// If the user does, return an array of their past session tokens, this is used so we can cull expired/duplicate tokens
// If the user does not have any previous tokens, return false
async function retrieveUserPastSessionTokens(uuid) {
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
    // Reference to sessions collection
    const sessionsCollection = db.collection("sessions");

    // Array of sessionToken objects the user previously had
    const usersPreviousTokens = sessionsCollection
      .find({ uuid: uuid })
      .toArray();

    // If we do not have any previous tokens, return false
    if ((await usersPreviousTokens) == false) {
      return false;
    }

    return await usersPreviousTokens;
  } catch (err) {
    console.log(err);
  } finally {
    if (client) {
      console.log("Closing client");
      await client.close();
    }
  }
}

// Given an array of tokens from a single user, remove tokens that are expired, or if the user has multiple tokens active which are not expired-
// remove all such that only one active token remains.
// Returns true if user needs a new token, returns the active token if false
async function removeExpiredAndDuplicateTokens(tokenArray, uuid) {
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
    // Reference to sessions collection
    const sessionsCollection = db.collection("sessions");

    // If the user needs a new token to be generated
    let needsNewToken = true;
    // If the user has non-expired tokens, we will return this one
    let sessionToken;

    // We separate these tokens into separate arrays because we will keep the final item in the nonExpiredTokens to be removed
    // The user will continue using this token which hasnt expired yet, the other ones will be removed

    // Tokens that have not reached their expiration time
    const nonExpiredTokensToBeRemoved = [];
    // Tokens that have expired
    const expiredTokensToBeRemoved = [];

    // If an element is not expired, add it to the array of nonExpired tokens
    // If an element is expired, add it to the array of expired tokens
    tokenArray.forEach((element) => {
      if (element.expires <= Date.now()) {
        expiredTokensToBeRemoved.push(element._id);
        console.log(JSON.stringify(element) + " is expired");
      } else {
        nonExpiredTokensToBeRemoved.push(element._id);
      }
    });

    // If there are any tokens in this array that means the user has a non-expired token already and we wont need to generate them a new one
    // We use .pop on the nonExpiredTokensToBeRemoved array because .pop removes the last element of the array, and the last element of said array is the token which has the longest time remaining before it expires
    if (nonExpiredTokensToBeRemoved.length >= 1) {
      needsNewToken = false;
      sessionToken = await sessionsCollection.findOne({
        _id: nonExpiredTokensToBeRemoved.pop(),
      });
    }

    // Remove the nonExpired duplicate tokens
    const idsToDelete = nonExpiredTokensToBeRemoved
      .concat(expiredTokensToBeRemoved)
      .map((id) => new ObjectId(id));
    const result = await sessionsCollection.deleteMany({
      _id: { $in: idsToDelete },
    });

    // If we delete any tokens, print out how many were deleted
    if (result.deletedCount) {
      console.log(
        `Removed ${result.deletedCount} duplicate and or expired session token(s).`
      );
    }

    if (!needsNewToken) {
      return {
        tokenID: sessionToken.tokenID,
        expires: sessionToken.expires,
      };
    }
    return true;
  } catch (err) {
    console.log(err);
  } finally {
    if (client) {
      console.log("Closing client");
      await client.close();
    }
  }
}

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

// sender_uuid: The uuid of the user who is sending the friend request
// sessionToken: session token of user who is sending the request
// recipient_name: the user to send friend request to (not uuid, this matches the email field currently)
async function sendFriendRequest(sender_uuid, recipient_name, sessionToken) {
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
    // Validate session token
    // Since we do not have the email of the request, we will just use the sessionToken for the cachedClients key in the database module
    if (!(await isValidSessionToken(sessionToken, sender_uuid))) {
      return false;
    }

    // Try to find the userToRequest
    // Grab users collection
    const usersCollection = db.collection("users");

    // Query users collection for userToRequest and the sender
    const recipient = await usersCollection.findOne({ email: recipient_name });
    const sender = await usersCollection.findOne({ uuid: sender_uuid });

    // If we cannot find the userToRequest, return false
    if (!recipient) {
      console.log(`${recipient_name} could not be found...`);
      return false;
    }

    // If a user tries to send a friend request to themself, return false
    if (recipient.uuid == sender_uuid) {
      console.log(`${recipient_name} tried to send themself a friend request`);
      return false;
    }

    // Logging
    console.log(
      `${sender.email} is trying to send a friend request to ${recipient.email}`
    );

    // Checks if the recipient already has sender on their friends list
    try {
      const alreadyFriends = recipient.friends.some(
        (element) => element.uuid === sender_uuid
      );
      if (alreadyFriends) {
        console.log(
          `${sender.email} is already friends with ${recipient.email} , a friend request will not be sent.`
        );
        return false;
      }
    } catch (err) {
      console.log(
        `${recipient.email} does not have any friends so we will not check their friends list for duplicate friends`
      );
    }

    // If the user to request already has a friend request from us, dont send another one and return false
    try {
      for (var i = 0; i < recipient.incomingFriendRequests.length; i++) {
        var incomingFriendRequest = recipient.incomingFriendRequests[i];
        if (incomingFriendRequest.sender_uuid == sender_uuid) {
          console.log(
            `${recipient_name} already has a friend request from ${sender.email}`
          );
          return false;
        }
      }
    } catch (err) {
      // If incomingFriendRequests is undefined, don't log the error (this error will occur when someone receieves their first friend request)
      // This is because the user will not have the 'incomingFriendRequests' array in their document
    }

    // Append a new friend request object to the incomingFriendRequests array of the recipient
    const modifyRecipientIncomingFriendRequests =
      await usersCollection.updateOne(
        { email: recipient_name },
        {
          $push: {
            incomingFriendRequests: {
              sender_uuid: `${sender_uuid}`,
              sender_name: `${sender.email}`,
            },
          },
        }
      );

    // Append the recipient uuid to the outgoingFriendRequests array of the sender
    const modifySenderOutgoingFriendRequests = await usersCollection.updateOne(
      { uuid: sender_uuid },
      {
        $push: {
          outgoingFriendRequests: {
            recipient_uuid: `${recipient.uuid}`,
          },
        },
      }
    );

    console.log(
      `${sender.email} has sent a friend request to ${recipient.email}`
    );
    return true;
  } catch (err) {
    console.log(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Given a uuid, retrieve all of the items of their incomingFriendRequests array
// uuid: read the incomingFriendRequests array of this uuid
async function getIncomingFriendRequests(uuid, sessionToken) {
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
    // Validate session token
    // Since we do not have the email of the request, we will just use the sessionToken for the cachedClients key in the database module
    if (!(await isValidSessionToken(sessionToken, uuid))) {
      return false;
    }

    // Grab users collection
    const usersCollection = db.collection("users");
    // Query users collection for userToRequest (the email)
    const result = await usersCollection.findOne({ uuid: uuid });

    // If the user does not have an incomingFriendRequests array
    if (result.incomingFriendRequests == undefined) {
      console.log(`${uuid} does not have an incoming friend requests array`);
      return [];
    }

    return result.incomingFriendRequests;
  } catch (err) {
    console.log(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// recipient_uuid: The uuid of the user who received a friend request
// sender_uuid: The uuid of the person who sent a friend request to the recipient
// If the recipient has a request from the sender in their incomingFriendRequests array
// And the sender has an outgoing request to the recipient in their outgoingFriendRequests array
// Add one another to the opposites friends list
async function acceptFriendRequest(recipient_uuid, sender_uuid, sessionToken) {
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
    // Validates the session token, we use the recipient_uuid here because this is the user sending the request
    if (!(await isValidSessionToken(sessionToken, recipient_uuid))) {
      return false;
    }

    // Grab users collection
    const usersCollection = db.collection("users");

    // Grab the recipient & sender user data
    const recipient = await usersCollection.findOne({ uuid: recipient_uuid });
    const sender = await usersCollection.findOne({ uuid: sender_uuid });

    // Logging
    console.log(
      `${recipient.email} is trying to accept a friend request from ${sender.email}`
    );

    // Ensure the recipient & sender both have the incoming & outgoing friend requests respectively
    const recipientHasTheRequest = recipient.incomingFriendRequests.some(
      (element) => element.sender_uuid === sender_uuid
    );
    const senderHasTheRequest = sender.outgoingFriendRequests.some(
      (element) => element.recipient_uuid === recipient_uuid
    );

    if (!recipientHasTheRequest) {
      console.log(
        `${recipient.email} does not have the incoming friend request from ${sender.email}`
      );
      return false;
    }

    if (!senderHasTheRequest) {
      console.log(
        `${sender.email} does not have an outgoing friend request to ${recipient.email}`
      );
      return false;
    }

    // Remove the incoming and outgoing friend requests
    const successRemoving = await removeIncomingOutgoingFriendRequests(
      usersCollection,
      sender,
      recipient
    );
    // Add each user to the others friends list
    const successFriending = await makeTwoUsersFriends(
      usersCollection,
      sender,
      recipient
    );

    // If everything is successful, return true
    if (successRemoving && successFriending) {
      console.log(
        `${recipient.email} successfully accepted a friend request from ${sender.email} !`
      );

      // Create a new chat channel which these users have access to
      const createChannelResult = await createChannel([
        sender.uuid,
        recipient.uuid,
      ]);

      console.log(createChannelResult);
      // In the friends object of both users, append the ucid of their DM chats to one another
      for (let idx = 0; idx < 2; idx++) {
        const uuid = [sender.uuid, recipient.uuid][idx];
        const opposite_uuid = [sender.uuid, recipient.uuid][1 - idx];
        console.log(`uuid: ${uuid} , oppositeuuid: ${opposite_uuid}`);
        await usersCollection.updateOne(
          { uuid: uuid, "friends.uuid": opposite_uuid },
          {
            $set: {
              "friends.$.ucid": createChannelResult.ucid,
            },
          }
        );
      }

      return true;
    }
    // If removing or adding to friends list fails, return false
    else {
      console.log(
        `Something went wrong when ${recipient.email} tried to accept a friend request from ${sender.email}\nsuccessRemoving=${successRemoving}, successFriending=${successFriending}`
      );
      return false;
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// recipient_uuid: The uuid of the user who received a friend request
// sender_uuid: The uuid of the person who sent a friend request to the recipient
// If the recipient has a request from the sender in their incomingFriendRequests array, delete that request
// Ifd the sender has an outgoing request to the recipient in their outgoingFriendRequests array, delete that request
async function declineFriendRequest(recipient_uuid, sender_uuid, sessionToken) {
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
    if (!(await isValidSessionToken(sessionToken, recipient_uuid))) {
      return false;
    }

    // Grab users collection
    const usersCollection = db.collection("users");

    // Grab the recipient & sender user data
    const recipient = await usersCollection.findOne({ uuid: recipient_uuid });
    const sender = await usersCollection.findOne({ uuid: sender_uuid });

    const removeResult = await removeIncomingOutgoingFriendRequests(
      usersCollection,
      sender,
      recipient
    );
    return removeResult;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// This method is called to remove incoming and outgoing friend requests from a sender and receiver object
// collection: Should be the users collection which contains the sender and receiver document
// senderObject: This is the document within the collection which sent the friend request
// recipientObject: This is the document within the collection which received the friend request
async function removeIncomingOutgoingFriendRequests(
  collection,
  senderObject,
  recipientObject
) {
  try {
    // Remove the senders outgoing request
    await collection.updateOne(
      { uuid: senderObject.uuid },
      {
        // Remove outgoing request
        $pull: {
          outgoingFriendRequests: {
            recipient_uuid: recipientObject.uuid,
          },
        },
      }
    );

    // Remove the recipients incoming request
    await collection.updateOne(
      { uuid: recipientObject.uuid },
      {
        // Remove incoming request
        $pull: {
          incomingFriendRequests: {
            sender_uuid: senderObject.uuid,
          },
        },
      }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

// Given the usersCollection, a senderObject, a recipientObject, put the sender and recipient on eachothers friends lists
async function makeTwoUsersFriends(collection, senderObject, recipientObject) {
  try {
    // Recipient
    await collection.updateOne(
      { uuid: recipientObject.uuid },
      {
        // Add to friends list
        $push: {
          friends: {
            uuid: senderObject.uuid,
            displayName: senderObject?.displayName,
          },
        },
      }
    );

    // Sender
    await collection.updateOne(
      { uuid: senderObject.uuid },
      {
        // Add to friends list
        $push: {
          friends: {
            uuid: recipientObject.uuid,
            displayName: recipientObject?.displayName,
          },
        },
      }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

// Given a uuid, retrieve all of the items of their friends array
// uuid: read the friends array of this uuid
async function getFriendsList(uuid, sessionToken) {
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
    // Validates session token
    if (!(await isValidSessionToken(sessionToken, uuid))) {
      return false;
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ uuid: uuid });

    // If the user has friends
    if (user?.friends?.length >= 1) {
      let friendsListObject = [];
      for (let i = 0; i < user.friends.length; i++) {
        let friendObject = {
          uuid: user.friends[i].uuid,
          displayName: user.friends[i].displayName,
          ucid: user.friends[i].ucid
        };
        friendsListObject.push(friendObject);
      }
      return friendsListObject;
    }

    console.log(`${user.email} does not have any friends to retrieve`);
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

// Given a uuid, remove the friend_uuid from the friends array if it is present
async function removeFriend(uuid, friend_uuid, sessionToken) {
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
    // Validates session token
    if (!(await isValidSessionToken(sessionToken, uuid))) {
      return false;
    }
    // Get the users collection
    const usersCollection = db.collection("users");

    [uuid, friend_uuid].map(async (uuid, idx, array) => {
      await usersCollection.updateOne(
        { uuid: uuid },
        {
          $pull: {
            friends: {
              uuid: array[1 - idx],
            },
          },
        }
      );
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

// Creates a channel
// participant_uuids: People who have access to this channel
async function createChannel(participant_uuids) {
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
    const channelCollection = db.collection("channels");

    // Generate ucid
    const ucid = await utility.generateUCID(db);

    // Create chat room object
    const channel = {
      // ucid: unique chat id (identifier for chat rooms)
      ucid: ucid,
      // authorized_users: (contains uuids of users that are allowed to access this room)
      authorized_users: [...participant_uuids],
      chat_history: {},
    };

    // Attempt to insert new chat room object

    const createChannelResult = await channelCollection.insertOne(channel);
    const grantAccessResult = await chatController.grantChannelAccess(ucid, [
      ...participant_uuids,
    ]);

    // Append the UCID to the participants channel access array
    if (createChannelResult.acknowledged & grantAccessResult) {
      console.log(`Successfully created a new chat room with ucid ${ucid}`);
      return {
        result: true,
        ucid: ucid,
      };
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
  registerUser,
  loginUser,
  generateSessionToken,
  isValidSessionToken,
  sendFriendRequest,
  getIncomingFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsList,
  createChannel,
  removeFriend,
};
