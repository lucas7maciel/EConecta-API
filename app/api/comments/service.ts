import prisma from "@/lib/prisma";
import { CreateCommentInput } from "./validation";

export async function createComment(
  data: CreateCommentInput,
  userId: string
) {
  console.log({ ...data, userId });
  return prisma.comment.create({
    data: { ...data, userId },
  });
}

export async function deleteComment(id: number) {
  return prisma.comment.delete({ where: { id } });
}

export async function listCommentsByTrashSpotId(trashSpotId: number) {
  return prisma.comment.findMany({ where: { trashSpotId } });
}
