import { NextResponse } from "next/server";

import { deleteComment } from "../service";
import { commentIdSchema } from "../validation";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const parsed = commentIdSchema.safeParse({ id: Number(rawId) });
    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { id } = parsed.data;

    try {
      await deleteComment(id);
      return NextResponse.json({ success: true });
    } catch (err: any) {
      if (err?.code === "P2025") {
        return NextResponse.json(
          { error: "Comentario nao encontrado" },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("DELETE /comments/:id error:", error);
    return NextResponse.json(
      { error: "Erro ao deletar o comentario" },
      { status: 500 }
    );
  }
}
