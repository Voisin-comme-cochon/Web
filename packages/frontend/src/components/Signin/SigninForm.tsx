import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PasswordInput from '@/components/PasswordInput';
import { ImageUploader } from '@/components/ImageUploader/ImageUploader';
import { signupFormSchema, type SignupFormValues } from '@/containers/Signin/signin.schema';
import { useAppNavigation } from '@/presentation/state/navigate';
import { AuthError, AuthUc } from '@/domain/use-cases/authUc';
import { AuthRepository } from '@/infrastructure/repositories/AuthRepository';
import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger,
} from '@/components/ui/multi-select';
import { TagUc } from '@/domain/use-cases/tagUc.ts';
import { TagRepository } from '@/infrastructure/repositories/TagRepository.ts';
import { TagModel } from '@/domain/models/tag.model.ts';
import { AddressAutocomplete } from '@/components/AddressSuggestion/AddressSuggestion.tsx';
import { useToast } from '@/presentation/hooks/useToast.ts';

interface AddressData {
    address: string;
    city: string;
    postcode: string;
    coordinates: [number, number];
    label: string;
}

export default function SigninForm() {
    const { goLanding, goLogin, goMyNeighborhood } = useAppNavigation();
    const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableTags, setAvailableTags] = useState<TagModel[]>([]);
    const { showSuccess } = useToast();

    useEffect(() => {
        const fetchTags = async () => {
            const tagUc = new TagUc(new TagRepository());
            try {
                const tags = await tagUc.getTags();
                setAvailableTags(tags);
            } catch (err) {
                console.error('Error fetching tags:', err);
                setError("Impossible de charger les centres d'intérêt disponibles.");
            }
        };

        fetchTags();
    }, []);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            address: '',
            password: '',
            description: '',
            profileImage: '',
            tags: [],
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        setError(null);
        setIsLoading(true);

        try {
            const authUc = new AuthUc(new AuthRepository());
            await authUc.signin({
                firstName: values.firstName,
                lastName: values.lastName,
                address: selectedAddress?.label || values.address,
                latitude: selectedAddress?.coordinates[1] || 0,
                longitude: selectedAddress?.coordinates[0] || 0,
                email: values.email,
                phone: values.phone,
                password: values.password,
                description: values.description,
                profileImage: values.profileImage,
                tags: values.tags
                    .map((tag) => {
                        const foundTag = availableTags.find((t) => t.name === tag);
                        return foundTag ? foundTag.id : null;
                    })
                    .filter((id) => id !== null) as number[],
            });
            showSuccess('Inscription réussie ! Bienvenue !');
            goMyNeighborhood();
        } catch (err) {
            if (err instanceof AuthError) {
                setError(err.message);
            } else {
                setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
                console.error('Signup error:', err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center">
            <Card className="w-full max-w-xl border-none shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Créer un compte</CardTitle>
                    <CardDescription className="text-primary/70">
                        Remplissez le formulaire ci-dessous pour rejoindre la communauté
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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="profileImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <ImageUploader
                                            value={field.value || null}
                                            onChange={(value) => {
                                                field.onChange(value || '');
                                                setError(null);
                                            }}
                                            onError={(error) => setError(error)}
                                            label="Photo de profil"
                                            maxFiles={1}
                                            aspectRatio="circle"
                                            showDefaultIcon={true}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prénom</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Prénom"
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
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nom"
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="06 12 34 56 78"
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
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="exemple@email.com"
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
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adresse</FormLabel>
                                        <FormControl>
                                            <AddressAutocomplete
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                    setError(null);
                                                }}
                                                placeholder="123 rue de la République, 75001 Paris"
                                                disabled={isLoading}
                                                onAddressSelect={(addressData) => {
                                                    setSelectedAddress(addressData);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Centres d'intérêt</FormLabel>
                                        <FormControl>
                                            <MultiSelector
                                                values={field.value}
                                                onValuesChange={(values) => {
                                                    field.onChange(values);
                                                    setError(null);
                                                }}
                                                className="w-full"
                                            >
                                                <MultiSelectorTrigger>
                                                    <MultiSelectorInput
                                                        placeholder="Sélectionnez vos centres d'intérêt..."
                                                        disabled={isLoading}
                                                    />
                                                </MultiSelectorTrigger>
                                                <MultiSelectorContent>
                                                    <MultiSelectorList>
                                                        {availableTags.map((tag) => (
                                                            <MultiSelectorItem
                                                                key={tag.id}
                                                                value={tag.name}
                                                                disabled={isLoading}
                                                            >
                                                                {tag.name}
                                                            </MultiSelectorItem>
                                                        ))}
                                                    </MultiSelectorList>
                                                </MultiSelectorContent>
                                            </MultiSelector>
                                        </FormControl>
                                        <p className="text-xs text-foreground/60">
                                            Sélectionnez au moins un centre d'intérêt pour personnaliser votre
                                            expérience
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Parlez-nous un peu de vous..."
                                                disabled={isLoading}
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setError(null);
                                                }}
                                                className="resize-none"
                                                rows={3}
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
                                        <FormLabel>Mot de passe</FormLabel>
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
                                        <p className="text-xs text-foreground/60">
                                            Le mot de passe doit contenir au moins 8 caractères, une majuscule, une
                                            minuscule et un chiffre
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2">
                                <Button type="submit" className="w-full" variant="orange" disabled={isLoading}>
                                    {isLoading ? 'Inscription en cours...' : "S'inscrire"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-foreground/70">
                        Vous avez déjà un compte ?
                        <Button variant={'link'} onClick={goLogin} className="text-orange hover:underline">
                            Se connecter
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
