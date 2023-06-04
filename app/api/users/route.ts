import { NextRequest, NextResponse } from "next/server";
import userController from "../userController";

// Get user display name, in the future, implement additional user information here such as profile pictures and bios
// limit is the max amount of messages to retrieve
export async function GET(req: NextRequest) {
  const uuidToGet = req.headers.get("uuid");

  const displayName = await userController.getDisplayNameFromUUID(uuidToGet);
  
  if (displayName) {
    return new NextResponse(JSON.stringify({ displayName }), {
      status: 200,
    });
  }

  return new NextResponse(JSON.stringify({}), {
    status: 404,
  });
}
