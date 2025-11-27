import { NextResponse } from "next/server";

import { createCollectionSpot, listCollectionSpots } from "./service";
import { collectionSpotSchema } from "./validation";
import { verifyAuth } from "@/lib/authJwt";

export async function GET() {
  try {
    const spots = await listCollectionSpots();
    return NextResponse.json({ data: spots });
  } catch (error) {
    console.error("Erro ao buscar pontos de coleta", error);
    return NextResponse.json(
      { error: "Erro ao buscar pontos de coleta" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = verifyAuth(req);

    if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { id } = payload;

    const body = await req.json();
    const parsed = collectionSpotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload inválido", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const spot = await createCollectionSpot(parsed.data, id);

    return NextResponse.json({ data: spot }, { status: 201 });
  } catch (error) {
    console.error("POST /collectionSpots error:", error);
    return NextResponse.json(
      { error: "Erro ao criar collectionSpot" },
      { status: 500 }
    );
  }
}
