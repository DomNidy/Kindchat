import { NextRequest, NextResponse } from "next/server";
import userController from "../userController";

export async function GET(req: NextRequest) {
  const uuid = req.cookies.get("uuid").value;
  const sessionToken = req.cookies.get("sessionToken").value;

  const friendsList = await userController.getFriendsList(uuid, sessionToken);

  if (!friendsList) {
    return new NextResponse("No friends found", {
      status: 404,
    });
  }

  return new NextResponse(JSON.stringify(friendsList), {
    status: 200,
  });
}
