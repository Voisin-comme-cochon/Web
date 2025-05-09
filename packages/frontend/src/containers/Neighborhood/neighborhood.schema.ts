import { z } from 'zod';

export const neighborhoodFormSchema = z.object({
    name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
    images: z.array(z.instanceof(File)).optional(),
});

export type NeighborhoodFormValues = z.infer<typeof neighborhoodFormSchema>;
