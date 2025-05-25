import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AuthUc, AuthError } from '@/domain/use-cases/authUc.ts';

const emailSchema = z.object({
    email: z.string().email({ message: 'Veuillez entrer une adresse email valide' }),
});

type FormValues = z.infer<typeof emailSchema>;

type RequestResetFormProps = {
    onSubmitSuccess: () => void;
    onLoginClick: () => void;
};

export default function RequestResetForm({ onSubmitSuccess, onLoginClick }: RequestResetFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: '',
        },
        mode: 'onChange',
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const authUc = new AuthUc();
            await authUc.requestPasswordReset(values.email);

            setEmailSent(true);
            onSubmitSuccess();
        } catch (err) {
            setError(
                err instanceof AuthError
                    ? err.message
                    : 'Une erreur est survenue lors de la demande de réinitialisation'
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

                    {emailSent && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <AlertTitle className="text-sm font-medium">Email envoyé</AlertTitle>
                            <AlertDescription className="text-xs">
                                Si un compte existe avec cette adresse email, vous recevrez un email avec les
                                instructions pour réinitialiser votre mot de passe.
                            </AlertDescription>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary font-medium">Adresse email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="votre@email.com"
                                        {...field}
                                        disabled={isSubmitting || emailSent}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full"
                        variant="orange"
                        disabled={isSubmitting || emailSent || !form.formState.isValid}
                    >
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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
