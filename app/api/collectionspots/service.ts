import prisma from "@/lib/prisma";

import {
  CollectionSpotInput,
  CollectionSpotUpdateInput,
} from "./validation";

export async function listCollectionSpots() {
  return prisma.collectionSpots.findMany({ include: { location: true } });
}

export async function createCollectionSpot(
  data: CollectionSpotInput,
  userId: string
) {
  const { location, ...spotData } = data;

  return prisma.collectionSpots.create({
    data: {
      ...spotData,
      location: { create: location },
      registeredBy: { connect: { id: userId } },
    },
    include: { location: true },
  });
}

export async function getCollectionSpotById(id: number) {
  return prisma.collectionSpots.findUnique({
    where: { id },
    include: { location: true },
  });
}

export async function updateCollectionSpot(
  id: number,
  data: CollectionSpotUpdateInput
) {
  const { location, ...spotData } = data;

  const updateData: Record<string, unknown> = { ...spotData };
  if (location) {
    updateData.location = { update: location };
  }

  return prisma.collectionSpots.update({
    where: { id },
    data: updateData,
    include: { location: true },
  });
}

export async function deleteCollectionSpot(id: number) {
  return prisma.collectionSpots.delete({ where: { id } });
}

export async function createCollectionSpotConfirmation(
  collectionSpotId: number,
  userId: string
) {
  return prisma.confirmation.create({
    data: {
      collectionSpotId,
      userId,
    },
  });
}

export async function deleteCollectionSpotConfirmation(
  collectionSpotId: number,
  userId: string
) {
  return prisma.confirmation.delete({
    where: {
      collectionSpotId_userId: { collectionSpotId, userId },
    },
  });
}
