import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Conteudo obrigatorio"),
  trashSpotId: z
    .coerce.number()
    .int()
    .positive("trashSpotId deve ser um numero positivo"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const commentIdSchema = z.object({
  id: z.number().int().positive(),
});
