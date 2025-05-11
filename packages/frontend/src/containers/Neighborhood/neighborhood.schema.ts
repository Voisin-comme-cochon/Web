import { z } from 'zod';

const geoJsonSchema = z.object({
    type: z.string(),
    coordinates: z.array(z.array(z.array(z.number()))),
});

export const neighborhoodFormSchema = z.object({
    name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
    images: z.array(z.instanceof(File)).optional(),
    geo: geoJsonSchema.optional(),
});

export type NeighborhoodFormValues = z.infer<typeof neighborhoodFormSchema>;
