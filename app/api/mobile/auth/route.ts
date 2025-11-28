import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type MobileCodePayload = {
  token: string;
  type: "mobile_code";
};

export async function POST(req: NextRequest) {
  let code: string | undefined;

  try {
    const body = await req.json();
    code = body?.code;
  } catch (err) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  let payload: MobileCodePayload;
  try {
    payload = jwt.verify(code, process.env.NEXTAUTH_SECRET!) as MobileCodePayload;
  } catch (err) {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  if (payload.type !== "mobile_code" || !payload.token) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  try {
    const verifiedSession = jwt.verify(
      payload.token,
      process.env.NEXTAUTH_SECRET!
    ) as jwt.JwtPayload;

    return NextResponse.json({
      token: payload.token,
      user: {
        id: verifiedSession.id,
        email: verifiedSession.email,
        name: verifiedSession.name,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "expired_or_invalid_session" },
      { status: 401 }
    );
  }
}

