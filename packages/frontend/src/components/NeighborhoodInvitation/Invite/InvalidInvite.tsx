import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function InvalidInvite() {
    return (
        <div className="min-h-screen bg-[#f2f5f8] font-sans flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#1a2a41] mb-2">Invitation invalide</h1>
                    <p className="text-[#1a2a41]/70 mb-6">
                        Le lien d'invitation que vous avez utilisé n'est pas valide ou a été corrompu.
                    </p>
                    <p className="text-sm text-[#1a2a41]/60 mb-6">
                        Vérifiez que vous avez copié le lien complet ou demandez une nouvelle invitation.
                    </p>
                    <Button asChild className="bg-[#e36f4c] hover:bg-[#d15e3b] text-white">
                        <a href="/">Retour à l'accueil</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
