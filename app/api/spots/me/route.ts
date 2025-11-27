import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/authJwt";

type SpotType = "trash" | "collection";

export async function GET(req: NextRequest) {
  try {
    const payload = verifyAuth(req);

    if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuario nao autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.trim() || undefined;
    const name = searchParams.get("name")?.trim() || undefined;
    const typeParam = searchParams.get("type")?.trim().toLowerCase();

    if (typeParam && typeParam !== "trash" && typeParam !== "collection") {
      return NextResponse.json(
        { error: "Tipo invalido. Use 'trash' ou 'collection'" },
        { status: 400 }
      );
    }

    const spotType = typeParam as SpotType | undefined;

    const baseTrashWhere = {
      registeredById: payload.id,
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
      ...(city && {
        location: { city: { contains: city, mode: "insensitive" as const } },
      }),
    };

    const baseCollectionWhere = {
      registeredById: payload.id,
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
      ...(city && {
        location: { city: { contains: city, mode: "insensitive" as const } },
      }),
    };

    const trashSpotsPromise =
      spotType === "collection"
        ? Promise.resolve(
            [] as Awaited<ReturnType<typeof prisma.trashSpot.findMany>>
          )
        : prisma.trashSpot.findMany({
            where: baseTrashWhere,
            include: { location: true },
          });

    const collectionSpotsPromise =
      spotType === "trash"
        ? Promise.resolve(
            [] as Awaited<ReturnType<typeof prisma.collectionSpots.findMany>>
          )
        : prisma.collectionSpots.findMany({
            where: baseCollectionWhere,
            include: { location: true },
          });

    const [trashSpots, collectionSpots] = await Promise.all([
      trashSpotsPromise,
      collectionSpotsPromise,
    ]);

    return NextResponse.json({
      data: {
        trashSpots,
        collectionSpots,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar spots do usuario", error);
    return NextResponse.json(
      { error: "Erro ao carregar spots do usuario" },
      { status: 500 }
    );
  }
}
