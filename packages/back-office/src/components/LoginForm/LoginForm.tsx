import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import PasswordInput from '@/components/PasswordInput.tsx';
import {AuthUc} from '@/domain/use-cases/authUc.ts';
import {useAppNavigation} from '@/presentation/state/navigate.ts';
import {useState} from 'react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {AuthError} from "../../../../common/errors/AuthError.ts";

const formSchema = z.object({
    email: z
        .string()
        .min(1, {message: "L'email est requis"})
        .email({message: 'Veuillez entrer une adresse email valide'}),
    password: z.string().min(1, {message: 'Le mot de passe est requis'}),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
    const {goDashboard} = useAppNavigation();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            const authUc = new AuthUc();
            const tokens = await authUc.login(values.email, values.password);
            const decodedUser = await authUc.decodeToken(tokens.access_token);
            if (!decodedUser.isSuperAdmin || decodedUser.exp < Date.now() / 1000) {
                setError('Droits insuffisants.');
                return;
            }
            goDashboard();
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
                <CardHeader className={"text-left"}>
                    <CardTitle className="text-2xl">Connexion</CardTitle>
                    <CardDescription className={'text-xs text-gray-600'}>
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
                                render={({field}) => (
                                    <FormItem className={"text-left"}>
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
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem className={"text-left"}>
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
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div>
                                <Button type="submit" className="w-full" variant={'blue'} disabled={isLoading}>
                                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
