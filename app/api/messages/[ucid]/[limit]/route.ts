import { NextRequest, NextResponse } from "next/server";
import chatController from "../../../chatController";

// Get messages from specified channel
// limit is the max amount of messages to retrieve
export async function GET(
  req: NextRequest,
  { params }: { params: { ucid: string; limit: string } }
) {
  // Read cookies of request
  const uuid = req.cookies.get("uuid").value;
  const sessionToken = req.cookies.get("sessionToken").value;

  // Parse the limit parameter as an integer so it can be passed to backend
  const parsedLimit = parseInt(params.limit);

  const result = await chatController.getMessagesInChannel(
    uuid,
    sessionToken,
    params.ucid,
    parsedLimit
  );

  if (result) {
    return new NextResponse(JSON.stringify({ result }), {
      status: 200,
    });
  }

  return new NextResponse(JSON.stringify({}), {
    status: 404,
  });
}
