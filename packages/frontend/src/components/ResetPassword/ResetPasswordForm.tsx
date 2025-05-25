import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'react-router-dom';
import { CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Button } from '@/components/ui/button.tsx';
import PasswordInput from '@/components/PasswordInput.tsx';
import PasswordRequirements from '@/components/ResetPassword/PasswordRequirements.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AuthUc, AuthError } from '@/domain/use-cases/authUc.ts';
import { AuthRepository } from '@/infrastructure/repositories/AuthRepository.ts';

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
            .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule' })
            .regex(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une minuscule' })
            .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'],
    });

type FormValues = z.infer<typeof passwordSchema>;

type ResetPasswordFormProps = {
    onSubmitSuccess: () => void;
    onLoginClick: () => void;
};

export default function ResetPasswordForm({ onSubmitSuccess, onLoginClick }: ResetPasswordFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const form = useForm<FormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        mode: 'onChange',
    });

    const password = form.watch('password');
    const confirmPassword = form.watch('confirmPassword');

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && password !== '';

    const onSubmit = async () => {
        if (!token) {
            setError("Token de réinitialisation manquant. Veuillez utiliser le lien fourni dans l'email.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const authUc = new AuthUc(new AuthRepository());
            await authUc.resetPassword(token, password);

            onSubmitSuccess();
        } catch (err) {
            setError(
                err instanceof AuthError
                    ? err.message
                    : 'Une erreur est survenue lors de la réinitialisation du mot de passe'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                            <AlertTitle className="text-sm font-medium">Erreur</AlertTitle>
                            <AlertDescription className="text-xs">{error}</AlertDescription>
                        </Alert>
                    )}

                    {!token && (
                        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                            <AlertTitle className="text-sm font-medium">Attention</AlertTitle>
                            <AlertDescription className="text-xs">
                                Token de réinitialisation manquant. Veuillez utiliser le lien fourni dans l'email.
                            </AlertDescription>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary font-medium">Nouveau mot de passe</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        value={field.value}
                                        onChangeCallback={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary font-medium">Confirmer le mot de passe</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        value={field.value}
                                        onChangeCallback={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <PasswordRequirements
                        hasMinLength={hasMinLength}
                        hasUpperCase={hasUpperCase}
                        hasLowerCase={hasLowerCase}
                        hasNumber={hasNumber}
                    />
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full"
                        variant="orange"
                        disabled={
                            !hasMinLength ||
                            !hasUpperCase ||
                            !hasLowerCase ||
                            !hasNumber ||
                            !passwordsMatch ||
                            isSubmitting ||
                            !token
                        }
                    >
                        {isSubmitting ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                    </Button>
                    <div className="text-center text-sm text-primary/70">
                        Retour à la{' '}
                        <Button
                            variant="link"
                            onClick={onLoginClick}
                            className="text-orange hover:underline font-medium p-0"
                            type="button"
                        >
                            page de connexion
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Form>
    );
}
