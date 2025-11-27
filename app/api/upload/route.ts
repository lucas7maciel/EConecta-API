import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { storage } from "@/lib/firebase";

type TargetType = "user" | "trashspot" | "collectionspot";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  const target = (formData.get("target") as string | null)?.toLowerCase() as
    | TargetType
    | undefined;
  const rawTargetId = formData.get("targetId") as string | null;

  if (!file) {
    return NextResponse.json(
      { error: "Nenhuma imagem enviada" },
      { status: 400 }
    );
  }

  if (!target || !rawTargetId) {
    return NextResponse.json(
      { error: "Informe target (user|trashspot|collectionspot) e targetId" },
      { status: 400 }
    );
  }

  if (!["user", "trashspot", "collectionspot"].includes(target)) {
    return NextResponse.json({ error: "Target invalido" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = `${Date.now()}-${file.name}`;
  const fileRef = storage.file(`uploads/${fileName}`);

  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
    },
    public: true,
  });

  const publicUrl = `https://storage.googleapis.com/${storage.name}/uploads/${fileName}`;

  const data: Prisma.ImageCreateInput = { url: publicUrl };

  try {
    switch (target) {
      case "user": {
        data.user = { connect: { id: rawTargetId } };
        break;
      }
      case "trashspot": {
        const spotId = Number(rawTargetId);
        if (!Number.isInteger(spotId) || spotId <= 0) {
          return NextResponse.json({ error: "targetId invalido" }, { status: 400 });
        }
        data.trashSpot = { connect: { id: spotId } };
        break;
      }
      case "collectionspot": {
        const spotId = Number(rawTargetId);
        if (!Number.isInteger(spotId) || spotId <= 0) {
          return NextResponse.json({ error: "targetId invalido" }, { status: 400 });
        }
        data.collectionSpot = { connect: { id: spotId } };
        break;
      }
    }

    const image = await prisma.image.create({ data });

    return NextResponse.json({ url: publicUrl, image }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Registro alvo nao encontrado" }, { status: 404 });
    }
    if (err?.code === "P2002") {
      // userId é unico para foto de perfil
      return NextResponse.json(
        { error: "Ja existe uma imagem associada a este usuario" },
        { status: 409 }
      );
    }
    console.error("Erro ao salvar imagem:", err);
    return NextResponse.json(
      { error: "Erro ao salvar imagem" },
      { status: 500 }
    );
  }
}
