import { z } from "zod";

const stayDuration = z.enum([
  "UP_TO_5_DAYS",
  "SEVERAL_WEEKS",
  "SEVERAL_MONTHS",
]).optional();
const vegetation = z.enum(["NONE", "LOW", "TALL"]).optional();
const water = z.enum(["ABUNDANT", "FRESH", "BRACKISH", "NONE"]);
const soil = z.enum(["FERTILE", "ROCKY", "COMPACT"]);
const terrain = z.enum(["FLAT", "STEEP", "INACCESSIBLE"]).optional();
const animals = z.enum(["VARIOUS", "FLIES", "HORSES", "PIGS"]);
const climate = z.enum([
  "TROPICAL",
  "TEMPERATE",
  "ARCTIC",
  "UNKNOWN",
  "NO_RESPONSE",
]).optional();
const disposal = z.enum(["TRASH_BINS_AVAILABLE"]);

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

export const spotSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  stayDuration: stayDuration.optional(),
  vegetation: vegetation.optional(),
  terrain: terrain.optional(),
  climate: climate.optional(),
  water: z.array(water).optional(),
  soil: z.array(soil).optional(),
  animals: z.array(animals).optional(),
  disposal: z.array(disposal).optional(),
  location: baseLocationSchema,
});

export type SpotInput = z.infer<typeof spotSchema>;
export type SpotUpdateInput = z.infer<typeof spotUpdateSchema>;

const locationUpdateSchema = baseLocationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Informe ao menos um campo em location",
  }
);

export const spotUpdateSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    stayDuration: stayDuration.optional(),
    vegetation: vegetation.optional(),
    terrain: terrain.optional(),
    climate: climate.optional(),
    water: z.array(water).optional(),
    soil: z.array(soil).optional(),
    animals: z.array(animals).optional(),
    disposal: z.array(disposal).optional(),
    location: locationUpdateSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe pelo menos um campo para atualizar",
  });
