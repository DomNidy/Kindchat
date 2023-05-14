import { NextRequest, NextResponse } from "next/server";
import chatController from "../../chatController";

export async function POST(
  req: NextRequest,
  { params }: { params: { ucid: string } }
) {
  const requestBody = await req.json();
  const uuid = req.cookies.get("uuid").value;
  const sessionToken = req.cookies.get("sessionToken").value;
  const messageContent = requestBody.message;

  const friendsList = await chatController.sendMessageInChannel(
    uuid,
    sessionToken,
    params.ucid
  );

  if (!friendsList) {
    return new NextResponse(JSON.stringify({}), {
      status: 404,
    });
  }

  return new NextResponse(JSON.stringify(friendsList), {
    status: 200,
  });
}
