import jwt from "jsonwebtoken";

export function verifyAuth(
  request: Request
): { id: string } | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    // Ajeitar isso dps
    const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {id: string};
    return  {id: payload.id};
  } catch {
    return null;
  }
}
