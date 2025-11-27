import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

import { deleteSpot, getSpotById, updateSpot } from "../service";
import { spotUpdateSchema } from "../validation";
import { verifyAuth } from "@/lib/authJwt";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyAuth(req);

    if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuario nao autenticado" },
        { status: 401 }
      );
    }

    const { id: rawId } = await params;
    const parsedId = idParamSchema.safeParse({ id: Number(rawId) });

    if (!parsedId.success) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const body = await req.json();
    const parsedBody = spotUpdateSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Payload invalido", issues: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { id } = parsedId.data;

    const existing = await getSpotById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Foco de lixo nao encontrado" },
        { status: 404 }
      );
    }

    if (existing.registeredById !== payload.id) {
      return NextResponse.json(
        { error: "Sem permissao para alterar este foco de lixo" },
        { status: 403 }
      );
    }

    const updated = await updateSpot(id, parsedBody.data);
    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    console.error("Erro ao atualizar foco de lixo", error);
    return NextResponse.json(
      { error: "Erro ao atualizar o foco de lixo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyAuth(req);

    if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuario nao autenticado" },
        { status: 401 }
      );
    }

    const { id: rawId } = await params;
    const parsedId = idParamSchema.safeParse({ id: Number(rawId) });

    if (!parsedId.success) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const { id } = parsedId.data;

    const existing = await getSpotById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Foco de lixo nao encontrado" },
        { status: 404 }
      );
    }

    if (existing.registeredById !== payload.id) {
      return NextResponse.json(
        { error: "Sem permissao para deletar este foco de lixo" },
        { status: 403 }
      );
    }

    await deleteSpot(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Erro ao deletar foco de lixo", error);
    return NextResponse.json(
      { error: "Erro ao deletar o foco de lixo" },
      { status: 500 }
    );
  }
}
