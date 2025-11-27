import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

import {
  createConfirmation,
  deleteConfirmation,
  getSpotById,
} from "../../service";
import { verifyAuth } from "@/lib/authJwt";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyAuth(req);
    
        if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { id: rawId } = await params;
    const parsed = idParamSchema.safeParse({ id: Number(rawId) });
    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { id } = parsed.data;

    const spot = await getSpotById(id);
    if (!spot) {
      return NextResponse.json(
        { error: "Foco de lixo não encontrado" },
        { status: 404 }
      );
    }

    try {
      const confirmation = await createConfirmation(id, payload.id);
      return NextResponse.json({ data: confirmation }, { status: 201 });
    } catch (err: any) {
      if (err?.code === "P2002") {
        return NextResponse.json(
          { error: "Confirmação já existe para este usuário e foco" },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("POST /trashspots/:id/confirm error:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar foco de lixo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyAuth(req);
    
        if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { id: rawId } = await params;
    const parsed = idParamSchema.safeParse({ id: Number(rawId) });

    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { id } = parsed.data;

    const spot = await getSpotById(id);
    if (!spot) {
      return NextResponse.json(
        { error: "Foco de lixo não encontrado" },
        { status: 404 }
      );
    }

    try {
      await deleteConfirmation(id, payload.id);
      return NextResponse.json({ success: true });
    } catch (err: any) {
      if (err?.code === "P2025") {
        return NextResponse.json(
          { error: "Confirmação não encontrada" },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("DELETE /trashspots/:id/confirm error:", error);
    return NextResponse.json(
      { error: "Erro ao remover confirmação" },
      { status: 500 }
    );
  }
}
