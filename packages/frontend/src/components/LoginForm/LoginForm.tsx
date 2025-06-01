import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PasswordInput from '@/components/PasswordInput.tsx';
import { AuthError, AuthUc } from '@/domain/use-cases/authUc.ts';
import { AuthRepository } from '@/infrastructure/repositories/AuthRepository.ts';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/presentation/hooks/useToast.ts';

const formSchema = z.object({
    email: z
        .string()
        .min(1, { message: "L'email est requis" })
        .email({ message: 'Veuillez entrer une adresse email valide' }),
    password: z.string().min(1, { message: 'Le mot de passe est requis' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
    const { goResetPassword, goSignin, goMyNeighborhood } = useAppNavigation();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        setError(null);
        setIsLoading(true);

        try {
            const authUc = new AuthUc(new AuthRepository());
            await authUc.login(values.email, values.password);
            showSuccess('Connexion réussie !', 'Bienvenue dans votre espace personnel !');
            // goCreateNeighborhood(); TODO: Checker si la personne a un quartier pour savoir où le rediriger
            goMyNeighborhood();
        } catch (err) {
            if (err instanceof AuthError) {
                setError(err.message);
            } else {
                setError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
                console.error('Unexpected login error:', err);
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className={'w-full flex items-center justify-center'}>
            <Card className="w-full max-w-md shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Connexion</CardTitle>
                    <CardDescription className={'text-primary/70'}>
                        Entrez vos identifiants pour accéder à votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-4">
                            <AlertTitle className="text-sm font-medium">Erreur</AlertTitle>
                            <AlertDescription className="text-xs">{error}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Adresse email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="exemple@mail.com"
                                                disabled={isLoading}
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setError(null);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Mot de passe</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                value={field.value}
                                                onChangeCallback={(value) => {
                                                    field.onChange(value);
                                                    setError(null);
                                                }}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>
                                <Button type="submit" className="w-full" variant={'orange'} disabled={isLoading}>
                                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>
                                <Button
                                    variant="link"
                                    className="text-orange hover:underline w-full text-xs mt-2"
                                    type="button"
                                    disabled={isLoading}
                                    onClick={goResetPassword}
                                >
                                    Mot de passe oublié ?
                                </Button>
                            </div>
                            <div className="flex text-sm justify-center items-center">
                                <p className={'text-gray-600 mr-2'}>Pas encore de compte ?</p>
                                <Button
                                    variant="link"
                                    onClick={goSignin}
                                    className="text-orange hover:underline px-0"
                                    type="button"
                                    disabled={isLoading}
                                >
                                    Créer un compte
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
