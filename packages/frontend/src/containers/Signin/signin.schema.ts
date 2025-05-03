import * as z from 'zod';

export const signupFormSchema = z.object({
    firstName: z.string().min(1, { message: 'Le prénom est requis' }),
    lastName: z.string().min(1, { message: 'Le nom est requis' }),
    phone: z
        .string()
        .min(1, { message: 'Le numéro de téléphone est requis' })
        .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, {
            message: 'Veuillez entrer un numéro de téléphone valide',
        }),
    email: z
        .string()
        .min(1, { message: "L'email est requis" })
        .email({ message: 'Veuillez entrer une adresse email valide' }),
    address: z.string().min(1, { message: "L'adresse est requise" }),
    password: z
        .string()
        .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
        .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule' })
        .regex(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une minuscule' })
        .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' }),
    profileImage: z.string().optional(),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
