import { NextRequest, NextResponse } from "next/server";
import userController from "../../userController";

export async function POST(
  req: NextRequest,
  { params }: { params: { accountToRequest: string } }
) {
  const uuid = req.cookies.get("uuid");
  const sessionToken = req.cookies.get("sessionToken");
  
  // Attempt to send the friend request
  let sendFriendRequestResult = await userController.sendFriendRequest(
    uuid.value,
    params.accountToRequest,
    sessionToken.value
  );
  // If friend request was sent successfully
  if (sendFriendRequestResult === true) {
    return new NextResponse("Friend request sent successfully", {
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
