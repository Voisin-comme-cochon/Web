import * as z from 'zod';

export const editGroupFormSchema = z.object({
    name: z
        .string()
        .min(1, { message: 'Le nom du groupe est requis' })
        .min(3, { message: 'Le nom doit contenir au moins 3 caractères' })
        .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),

    description: z
        .string()
        .min(1, { message: 'La description est requise' })
        .min(10, { message: 'La description doit contenir au moins 10 caractères' })
        .max(500, { message: 'La description ne peut pas dépasser 500 caractères' }),

    type: z.enum(['public', 'private'], {
        required_error: 'Le type de groupe est requis',
    }),

    tagId: z
        .string()
        .optional()
        .refine((val) => val === undefined || val === '' || (parseInt(val, 10) > 0 && !isNaN(parseInt(val, 10))), {
            message: "Le tag sélectionné n'est pas valide",
        }),
});

export type EditGroupFormValues = z.infer<typeof editGroupFormSchema>;
