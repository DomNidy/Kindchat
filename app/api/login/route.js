import userController from '../userController'
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
    // Read request data
    const { email, password } = await req.json();
    // Attempt to login
    let loginAttempt = await userController.loginUser(email, password);

    // If the login attempt was successful (matching credentials)
    if (loginAttempt.success === true) {
        // Create response
        const res = new NextResponse();

        // Handle sessionToken generation / retrieval
        const sessionToken = await userController.generateSessionToken(loginAttempt.uuid);

        // Loging
        console.log(`${email} has logged in, sessionToken: ${sessionToken.tokenID}`);

        // Set cookies
        res.cookies.set('sessionToken', sessionToken.tokenID, {
            expires: sessionToken.expires
        });

        res.cookies.set('uuid', loginAttempt.uuid);

        return res;
    }
    
    return new NextResponse('Failed to login', {
        status: 400,
        statusText: loginAttempt.message
    });
}