import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImageUploader } from '@/components/ImageUploader/ImageUploader';
import { neighborhoodFormSchema, type NeighborhoodFormValues } from '@/containers/Neighborhood/neighborhood.schema';

interface NeighborhoodFormProps {
    onSubmit: (values: NeighborhoodFormValues) => Promise<void>;
    onNext: () => void;
    initialValues?: NeighborhoodFormValues;
}

export function NeighborhoodForm({ onSubmit, onNext, initialValues }: NeighborhoodFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<NeighborhoodFormValues>({
        resolver: zodResolver(neighborhoodFormSchema),
        defaultValues: initialValues || {
            name: '',
            description: '',
            images: [],
        },
    });

    const handleSubmit = async (values: NeighborhoodFormValues) => {
        setError(null);
        setIsLoading(true);

        try {
            await onSubmit(values);
            onNext();
        } catch (err) {
            setError('Une erreur est survenue lors de la création du quartier. Veuillez réessayer.');
            console.error('Neighborhood creation error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center">
            <Card className="w-full max-w-xl border-none shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-foreground">Créer un quartier</CardTitle>
                    <CardDescription className="text-foreground/70">
                        Étape 1/2 : Informations générales du quartier
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
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom du quartier</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Quartier Latin"
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Décrivez votre quartier..."
                                                disabled={isLoading}
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setError(null);
                                                }}
                                                className="resize-none"
                                                rows={4}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <ImageUploader
                                            value={field.value || []}
                                            onChange={(files) => {
                                                field.onChange(files);
                                                setError(null);
                                            }}
                                            onError={(error) => setError(error)}
                                            label="Images du quartier"
                                            maxFiles={5}
                                            aspectRatio="square"
                                            maxFileSize={5 * 1024 * 1024}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2">
                                <Button type="submit" className="w-full" variant="orange" disabled={isLoading}>
                                    {isLoading ? 'Création en cours...' : 'Continuer'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
