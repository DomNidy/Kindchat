import { NextRequest, NextResponse } from "next/server";
import chatController from "../../chatController";

export async function POST(
  req: NextRequest,
  { params }: { params: { ucid: string } }
) {
  const requestBody = await req.json();
  const uuid = req.cookies.get("uuid").value;
  const sessionToken = req.cookies.get("sessionToken").value;
  
  const message = {
    sender_uuid: uuid,
    messageContent: requestBody.messageContent,
    timestamp: Date.now(),
  };

  const friendsList = await chatController.sendMessageInChannel(
    uuid,
    sessionToken,
    params.ucid,
    message
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
