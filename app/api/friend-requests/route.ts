import userController from "../userController";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const uuid = req.cookies.get("uuid");
  const sessionToken = req.cookies.get("sessionToken");

  // Get incoming friend requests for the uuid
  let incomingRequests = await userController.getIncomingFriendRequests(
    uuid?.value,
    sessionToken?.value
  );

  // If the user does not have any incoming friend requests
  if (incomingRequests == false) {
    let res = new NextResponse(JSON.stringify(incomingRequests), {
      status: 200,
    });

    res.cookies.set("incomingFriendRequests", JSON.stringify([]));
    return res;
  }

  let res = new NextResponse(JSON.stringify(incomingRequests), {
    status: 200,
  });

  return res;
}
