import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get("callbackUrl");

  if (!callbackUrl) {
    return NextResponse.json({ error: "callbackUrl required" }, { status: 400 });
  }

  const session = await auth();

  const target = new URL(callbackUrl);

  if (session) {
    const code = jwt.sign(
      { token: session, type: "mobile_code" },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "5m" }
    );
    target.searchParams.set("code", code);
  } else {
    target.searchParams.set("error", "no_session");
  }

  return NextResponse.redirect(target.toString());
}
