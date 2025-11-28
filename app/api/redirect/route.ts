import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get("callbackUrl");

  if (!callbackUrl) {
    return NextResponse.json({ error: "callbackUrl required" }, { status: 400 });
  }

  const session = await auth();
  console.log("Redirect session:", session);
  const sessionToken = (session as {sessionToken?: string})?.sessionToken;

  const target = new URL(callbackUrl);

  if (sessionToken) {
    target.searchParams.set("token", sessionToken);
  } else {
    target.searchParams.set("error", "no_session");
  }

  return NextResponse.redirect(target.toString());
}
