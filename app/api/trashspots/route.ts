import { NextResponse } from "next/server";

import { auth } from "@/auth";

import { createSpot, listSpots } from "./service";
import { spotSchema } from "./validation";

export async function GET() {
  try {
    // + Adicionar filtros
    const spots = await listSpots();
    return NextResponse.json({ data: spots });
  } catch (error) {
    console.error("Erro ao buscar trashSpots", error);
    return NextResponse.json(
      { error: "Erro ao buscar trashSpots" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuario nao autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = spotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload inválido", issues: parsed.error },
        { status: 400 }
      );
    }

    const spot = await createSpot(parsed.data, session.user.id);

    return NextResponse.json({ data: spot }, { status: 201 });
  } catch (error) {
    console.error("POST /trashSpots error:", error);
    return NextResponse.json(
      { error: "Erro ao criar o trashSpot" },
      { status: 500 }
    );
  }
}
