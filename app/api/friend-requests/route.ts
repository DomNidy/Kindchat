import userController from "../userController";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const uuid = req.cookies.get("uuid");
  const sessionToken = req.cookies.get("sessionToken");

  type IncomingRequestsResponse = {
    requests: Array<string>;
  };

  // Get incoming friend requests for the uuid
  let incomingRequests = await userController.getIncomingFriendRequests(
    uuid.value,
    sessionToken.value
  );

  // If the user does not have any incoming friend requests
  if (incomingRequests == false) {
    let res = new NextResponse("No incoming requests", {
      status: 200,
    });

    res.cookies.set("incomingFriendRequests", JSON.stringify([]));
    return res;
  }

  let res = new NextResponse("", {
    status: 200,
  });

  res.cookies.set("incomingFriendRequests", JSON.stringify(incomingRequests));
  return res;
}
