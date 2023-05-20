import { NextRequest, NextResponse } from "next/server";
import userController from "../../userController";

// Returns an array of channel ucids that the user has access to
export async function GET(req: NextRequest) {
  const uuid = req.cookies.get("uuid");
  const sessionToken = req.cookies.get("sessionToken");
  
  // Attempt to retrieve
  let getChannelAccessResult = await userController.getChannelAccess(
    uuid.value,
    sessionToken.value
  );

  // If friend request was sent successfully
  if (getChannelAccessResult != false) {
    return new NextResponse(JSON.stringify(getChannelAccessResult), {
      status: 200,
    });
  }
  // Failed to send friend request
  else {
    return new NextResponse("Failed to send friend request", {
      status: 400,
    });
  }
}
