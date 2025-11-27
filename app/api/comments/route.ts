import { NextResponse } from "next/server";
import { createComment } from "./service";
import { createCommentSchema } from "./validation";
import { verifyAuth } from "@/lib/authJwt";

export async function POST(req: Request) {
  try {
    const payload = verifyAuth(req);
    
        if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = createCommentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload invalido", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    // Tratar quando trashspotId não existe
    const comment = await createComment(parsed.data, payload.id);

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("POST /comments error:", error);
    return NextResponse.json(
      { error: "Erro ao criar o comentario" },
      { status: 500 }
    );
  }
}
