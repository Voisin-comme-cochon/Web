import { UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

export function AlreadyMember() {
    const { goMyNeighborhood } = useAppNavigation();
    return (
        <div className="min-h-screen bg-[#f2f5f8] font-sans flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                    <UserCheck className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#1a2a41] mb-2">Déjà membre</h1>
                    <p className="text-[#1a2a41]/70 mb-6">
                        Vous êtes déjà membre de ce quartier et ne pouvez pas utiliser cette invitation.
                    </p>
                    <p className="text-sm text-[#1a2a41]/60 mb-6">
                        Vous pouvez directement accéder à votre quartier depuis votre tableau de bord.
                    </p>
                    <div className="space-y-3">
                        <Button asChild className="bg-[#e36f4c] hover:bg-[#d15e3b] text-white w-full">
                            <a href="/dashboard">Accéder à mon quartier</a>
                        </Button>
                        <Button asChild variant="outline" className="w-full" onClick={() => goMyNeighborhood()}>
                            Retour à l'accueil
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
