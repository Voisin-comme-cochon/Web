import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

export function MemberRefused() {
    const { goMyNeighborhood, goJoinNeighborhood } = useAppNavigation();
    return (
        <div className="min-h-screen bg-[#f2f5f8] font-sans flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                    <UserX className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#1a2a41] mb-2">Demande refusée</h1>
                    <p className="text-[#1a2a41]/70 mb-2">Votre demande pour ce quartier a été refusé.</p>
                    <p className="text-sm text-[#1a2a41]/60 mb-6">
                        Vous pouvez voir quels quartiers sont disponibles autour de chez vous.
                    </p>
                    <div className="space-y-3">
                        <Button
                            className="bg-[#e36f4c] hover:bg-[#d15e3b] text-white w-full"
                            onClick={() => goJoinNeighborhood()}
                        >
                            Découvrir des quartiers
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => goMyNeighborhood()}>
                            Retour à l'accueil
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
