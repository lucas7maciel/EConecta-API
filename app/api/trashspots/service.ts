import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { SpotInput, SpotUpdateInput } from "./validation";

export async function listSpots() {
  const spots = await prisma.trashSpot.findMany({
    include: {
      location: true,
      registeredBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      images: {
        select: { id: true, url: true },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  });

  return spots.map(({ images, ...spot }) => ({
    ...spot,
    lastImage: images[0] ?? null,
  }));
}

export async function createSpot(data: SpotInput, userId: string) {
  const {
    location,
    water = [],
    soil = [],
    animals = [],
    disposal = [],
    stayDuration,
    vegetation,
    terrain,
    climate,
    name,
    description,
  } = data;

  const createData = {
    name,
    description: description ?? undefined,
    stayDuration: stayDuration,
    vegetation: vegetation,
    terrain: terrain,
    climate: climate,
    water,
    soil,
    animals,
    disposal,
    location: { create: location },
    registeredBy: { connect: { id: userId } },
  };

  return prisma.trashSpot.create({
    data: createData as Prisma.TrashSpotCreateInput,
    include: { location: true },
  });
}

export async function getSpotById(id: number) {
  return prisma.trashSpot.findUnique({
    where: { id },
    include: { location: true },
  });
}

export async function updateSpot(id: number, data: SpotUpdateInput) {
  const { location, ...spotData } = data;

  const updateData: Record<string, unknown> = { ...spotData };
  if (location) {
    updateData.location = { update: location };
  }

  return prisma.trashSpot.update({
    where: { id },
    data: updateData,
    include: { location: true },
  });
}

export async function deleteSpot(id: number) {
  return prisma.trashSpot.delete({ where: { id } });
}

export async function createConfirmation(trashSpotId: number, userId: string) {
  return prisma.confirmation.create({
    data: {
      trashSpotId,
      userId,
    },
  });
}

export async function deleteConfirmation(trashSpotId: number, userId: string) {
  return prisma.confirmation.delete({
    where: {
      trashSpotId_userId: { trashSpotId, userId },
    },
  });
}
