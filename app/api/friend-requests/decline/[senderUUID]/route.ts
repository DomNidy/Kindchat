import userController from "../../../userController";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { senderUUID: string } }
) {
  const uuid = req.cookies.get("uuid").value;
  const sessionToken = req.cookies.get("sessionToken").value;

  const result = await userController.declineFriendRequest(
    uuid,
    params.senderUUID,
    sessionToken
  );

  console.log(result);

  if (!result) {
    return new NextResponse("Failed to decline friend request", {
      status: 400,
    });
  }
  return new NextResponse("Friend request declined successfully", {
    status: 200,
  });
}
