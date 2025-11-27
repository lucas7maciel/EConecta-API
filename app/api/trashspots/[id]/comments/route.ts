import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

import { listCommentsByTrashSpotId } from "../../../comments/service";
import { getSpotById } from "../../service";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const parsed = idParamSchema.safeParse({ id: rawId });
    
    if (!parsed.success) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const { id } = parsed.data;

    const spot = await getSpotById(id);
    if (!spot) {
      return NextResponse.json(
        { error: "Foco de lixo nao encontrado" },
        { status: 404 }
      );
    }

    const comments = await listCommentsByTrashSpotId(id);
    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error("GET /trashspots/:id/comments error:", error);
    return NextResponse.json(
      { error: "Erro ao listar comentarios" },
      { status: 500 }
    );
  }
}
