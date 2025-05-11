import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MapBox from '@/components/MapBox/MapBox';
import { useAppNavigation } from '@/presentation/state/navigate';

interface NeighborhoodMapFormProps {
    onSubmit: (geo: { type: string; coordinates: number[][][] }) => Promise<void>;
    onBack: () => void;
}

export function NeighborhoodMapForm({ onSubmit, onBack }: NeighborhoodMapFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGeo, setSelectedGeo] = useState<{ type: string; coordinates: number[][][] } | null>(null);
    const { goHome } = useAppNavigation();

    const handleSubmit = async () => {
        if (!selectedGeo) {
            setError('Veuillez sélectionner les bordures du quartier');
            return;
        }

        console.log(selectedGeo);

        setError(null);
        setIsLoading(true);

        try {
            await onSubmit(selectedGeo);
            goHome();
        } catch (err) {
            setError('Une erreur est survenue lors de la création du quartier. Veuillez réessayer.');
            console.error('Neighborhood creation error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center">
            <Card className="w-full max-w-4xl border-none shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-foreground">Créer un quartier</CardTitle>
                    <CardDescription className="text-foreground/70">
                        Étape 2/2 : Définition des bordures du quartier
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-4">
                            <AlertTitle className="text-sm font-medium">Erreur</AlertTitle>
                            <AlertDescription className="text-xs">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div className="h-[500px] w-full">
                            <MapBox
                                canCreate={true}
                                showDetails={false}
                                onGeoSelect={(geo) => {
                                    setSelectedGeo(geo);
                                    setError(null);
                                }}
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                                Retour
                            </Button>
                            <Button type="button" variant="orange" onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Création en cours...' : 'Créer le quartier'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
