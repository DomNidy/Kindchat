require('dotenv').config();
const bcrypt = require('bcrypt');
const { getClient, dbName } = require('./database.js')
const { randomUUID } = require('crypto');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

async function registerUser(email, password) {
    let client;
    try {
        // Get client
        client = getClient();
        // Connect client
        await client.connect();

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
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: email });

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

// Generates a session Token and then creates and inserts a sessionToken object on the database
async function generateSessionToken(email) {
    let client;
    try {
        // Get past tokens the user that are still stored in the db
        const needsNewToken = await checkIfUserHasActiveSessionToken(email).then(async (pastTokens) => {
            return await removeNonExpiredDuplicates(pastTokens);
        });

        if (needsNewToken === true) {
            console.log(`User ${email} needs a new session token, generating one...`)
            // Get client reference
            let client = getClient();
            // Connect client
            await client.connect();
            // Get db reference
            const db = client.db(dbName);
            // Reference to sessions collection
            const sessionsCollection = db.collection('sessions');

            // Generates the actual uuid assosciated with the sessionToken (the string of numbers and letters)
            const tokenID = randomUUID();
            // Token expires 18000000 miliseconds from now (5 hours)
            const expirationTime = Date.now() + 18000000;
            // Create sessionToken object to be inserted in database
            const sessionToken = ({
                email: email,
                tokenID: tokenID,
                expires: expirationTime
            });
            const insertResult = await sessionsCollection.insertOne(sessionToken);
            console.log("Inserted a session token:", insertResult);
            return tokenID;
        }
        else {
            console.log(`User ${email} already has an active session token`)
            return needsNewToken;
        }
    }
    catch (err) {
        console.log(err);
    }
    finally {
        if (client) {
            client.close();
        }
    }
}

// Checks if user already has a session token active
async function checkIfUserHasActiveSessionToken(email) {
    let client
    try {
        client = getClient();
        await client.connect();
        // Get db reference
        const db = client.db(dbName);
        // Reference to sessions collection
        const sessionsCollection = db.collection('sessions');

        // Array of sessionToken objects the user previously had
        const usersPreviousTokens = (sessionsCollection.find({ email: email })).toArray();
        return await usersPreviousTokens;
    }
    catch (err) {
        console.log(err);
    }
    finally {
        if (client) {
            client.close();
        }
    }
}

// Returns true if user needs a new token, if false returns the active token
async function removeNonExpiredDuplicates(tokenArray) {
    let client;
    try {
        client = getClient();
        // Connect client
        await client.connect();
        // Get db reference
        const db = client.db(dbName);
        // Reference to sessions collection
        const sessionsCollection = db.collection('sessions');

        // If the user needs a new token to be generated
        let needsNewToken = true;
        // Tokens that have not reached their expiration time
        const nonExpiredTokensToBeRemoved = []

        // If an element is not expired, add it to the array of tokens to remove
        tokenArray.forEach(element => {
            if (element.expires <= Date.now()) {
                console.log(JSON.stringify(element) + " is expired")
            }
            else {
                nonExpiredTokensToBeRemoved.push(element._id);
            }
        });

        // If there are any tokens in this array that means the user has a non-expired token already and we wont need to generate them a new one
        if (nonExpiredTokensToBeRemoved.length >= 1) {
            needsNewToken = nonExpiredTokensToBeRemoved.pop();;            
        }

        // Remove the nonExpired duplicate tokens
        const idsToDelete = nonExpiredTokensToBeRemoved.map(id => new ObjectId(id));
        const result = await sessionsCollection.deleteMany({ _id: { $in: idsToDelete } });

        console.log(`Removed ${result.deletedCount} duplicate session tokens`);
        return needsNewToken;
    }
    catch (err) {
        console.log(err);
    }
    finally {
        if (client) {
            client.close();
        }
    }
}

module.exports = { registerUser, loginUser, generateSessionToken };