import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { CardContent } from '@/components/ui/card.tsx';

type ResetPasswordSuccessProps = {
    onLoginClick: () => void;
};

export default function ResetPasswordSuccess({ onLoginClick }: ResetPasswordSuccessProps) {
    return (
        <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <div className="flex items-center mb-2">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-medium text-green-800">Mot de passe réinitialisé avec succès</h3>
                </div>
                <p className="text-green-700 text-sm">
                    Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de
                    passe.
                </p>
            </div>
            <Button className="w-full" variant="orange" onClick={onLoginClick}>
                Se connecter
            </Button>
        </CardContent>
    );
}
