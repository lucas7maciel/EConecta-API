import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";

import {
  createCollectionSpotConfirmation,
  deleteCollectionSpotConfirmation,
  getCollectionSpotById,
} from "../../service";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuario nao autenticado" },
        { status: 401 }
      );
    }

    const { id: rawId } = await params;
    const parsed = idParamSchema.safeParse({ id: Number(rawId) });
    
    if (!parsed.success) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const { id } = parsed.data;

    const spot = await getCollectionSpotById(id);
    if (!spot) {
      return NextResponse.json(
        { error: "Ponto de coleta nao encontrado" },
        { status: 404 }
      );
    }

    try {
      const confirmation = await createCollectionSpotConfirmation(
        id,
        session.user.id
      );
      return NextResponse.json({ data: confirmation }, { status: 201 });
    } catch (err: any) {
      if (err?.code === "P2002") {
        return NextResponse.json(
          { error: "Confirmacao ja existe para este usuario e ponto" },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("POST /collectionspots/:id/confirm error:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar ponto de coleta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuario nao autenticado" },
        { status: 401 }
      );
    }

    const { id: rawId } = await params;
    const parsed = idParamSchema.safeParse({ id: Number(rawId) });

    if (!parsed.success) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const { id } = parsed.data;

    const spot = await getCollectionSpotById(id);
    if (!spot) {
      return NextResponse.json(
        { error: "Ponto de coleta nao encontrado" },
        { status: 404 }
      );
    }

    try {
      await deleteCollectionSpotConfirmation(id, session.user.id);
      return NextResponse.json({ success: true });
    } catch (err: any) {
      if (err?.code === "P2025") {
        return NextResponse.json(
          { error: "Confirmacao nao encontrada" },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("DELETE /collectionspots/:id/confirm error:", error);
    return NextResponse.json(
      { error: "Erro ao remover confirmacao" },
      { status: 500 }
    );
  }
}
