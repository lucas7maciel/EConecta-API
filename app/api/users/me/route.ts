import { NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const [trashSpotsCount, confirmationsCount] = await Promise.all([
      prisma.trashSpot.count({ where: { registeredById: session.user.id } }),
      prisma.confirmation.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      data: {
        name: user.name,
        email: user.email,
        trashSpotsCount,
        confirmationsCount,
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
