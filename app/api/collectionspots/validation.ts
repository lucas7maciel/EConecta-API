import { z } from "zod";

const baseLocationSchema = z.object({
  latitude: z
    .number({ message: "Latitude deve ser numerica" })
    .min(-90, "Latitude minima -90")
    .max(90, "Latitude maxima 90"),
  longitude: z
    .number({ message: "Longitude deve ser numerica" })
    .min(-180, "Longitude minima -180")
    .max(180, "Longitude maxima 180"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  formattedAddr: z.string().optional(),
});

export const collectionSpotSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  email: z.string().email("Email invalido"),
  location: baseLocationSchema,
});

export type CollectionSpotInput = z.infer<typeof collectionSpotSchema>;
export type CollectionSpotUpdateInput = z.infer<typeof collectionSpotUpdateSchema>;

const locationUpdateSchema = baseLocationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Informe ao menos um campo em location",
  }
);

export const collectionSpotUpdateSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Email invalido").optional(),
    location: locationUpdateSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe pelo menos um campo para atualizar",
  });
