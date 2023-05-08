import { NextRequest, NextResponse } from "next/server";
import userController from "../../../userController";

export async function PUT(
  req: NextRequest,
  { params }: { params: { senderUUID: string } }
) {
  const uuid = req.cookies.get("uuid").value;
  const sessionToken = req.cookies.get("sessionToken").value;

  const result = await userController.acceptFriendRequest(
    uuid,
    params.senderUUID,
    sessionToken
  );

  if (!result) {
    return new NextResponse("Failed to accept friend request", {
      status: 400,
    });
  }
  return new NextResponse("Friend request accepted successfully", {
    status: 200,
  });
}
