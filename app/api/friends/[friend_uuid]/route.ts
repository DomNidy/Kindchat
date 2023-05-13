import { NextRequest, NextResponse } from "next/server";
import userController from "../../userController";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { friend_uuid: string } }
) {
  const uuid = req.cookies.get("uuid").value;
  const sessionToken = req.cookies.get("sessionToken").value;
  const friend_uuid = params.friend_uuid;

  console.log(uuid, sessionToken, friend_uuid);

  const removeResult = await userController.removeFriend(
    uuid,
    friend_uuid,
    sessionToken
  );

  console.log(`removeResult ${true}`);
  if (removeResult) {
    return new NextResponse("Friend removed successfully", {
      status: 200,
    });
  } else {
    return new NextResponse("Could not remove friend", {
      status: 400,
    });
  }
}
