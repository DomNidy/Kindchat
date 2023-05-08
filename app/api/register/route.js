import { headers } from "next/headers";
import userController from '../userController';
import { NextResponse } from "next/server";

export async function POST(req) {
    // Read request payload
    const { email, password } = await req.json();
    // Register in database
    const registerAttempt = await userController.registerUser(email, password);

    // If register attempt fails
    if (registerAttempt.success === false) {
        // Log
        console.log(registerAttempt.message);
        
        let res = new NextResponse('Failed to register', {
            status: 400,
            statusText: registerAttempt.message
        });
        return res;
    }

    // Generate session token for new user
    const sessionToken = await userController.generateSessionToken(registerAttempt.uuid);
    console.log(`${email} has successfully registered, generated a new sessionToken: ${sessionToken.tokenID}`);
    
    // Create response
    let res = new NextResponse('Register success', {
        status: 200,
        statusText: registerAttempt.message
    });

    // Set cookies
    res.cookies.set('sessionToken', sessionToken.tokenID, {
        expires: sessionToken.expires
    });

    res.cookies.set('uuid', registerAttempt.uuid);

    return res;
}