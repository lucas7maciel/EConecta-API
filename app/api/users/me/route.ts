import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/authJwt";

export async function GET(request: Request) {
  try {
    const payload = verifyAuth(request);

    if (!payload || !payload?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { id } = payload;
    console.log("ID:", id)

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const [trashSpotsCount, confirmationsCount, commentsCount] = await Promise.all([
      prisma.trashSpot.count({ where: { registeredById: id } }),
      prisma.confirmation.count({ where: { userId: id } }),
      prisma.comment.count({ where: { userId: id } }),
    ]);

    return NextResponse.json({
      data: {
        user,
        trashSpotsCount,
        confirmationsCount,
        commentsCount,
      },
    });
  } catch (error) {
    console.error("GET /users/me error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados do usuário" },
      { status: 500 }
    );
  }
}
