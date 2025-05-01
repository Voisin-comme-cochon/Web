import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import ResetPasswordForm from '@/components/ResetPassword/ResetPasswordForm.tsx';
import ResetPasswordSuccess from '@/components/ResetPassword/ResetPasswordSuccess.tsx';
import Header from '@/components/Header/Header.tsx';

export default function ResetPasswordPage() {
    const [resetSuccess, setResetSuccess] = useState(false);
    const { goLogin } = useAppNavigation();

    const handleResetSuccess = () => {
        setResetSuccess(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4 md:p-6">
                <Card className="w-full max-w-md border-none shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-primary">
                            Réinitialiser votre mot de passe
                        </CardTitle>
                        <CardDescription className="text-primary/70">
                            Veuillez créer un nouveau mot de passe sécurisé pour votre compte
                        </CardDescription>
                    </CardHeader>

                    {resetSuccess ? (
                        <ResetPasswordSuccess onLoginClick={goLogin} />
                    ) : (
                        <ResetPasswordForm onSubmitSuccess={handleResetSuccess} onLoginClick={goLogin} />
                    )}
                </Card>
            </main>

            <p className={'absolute bottom-4 left-1/2 transform -translate-x-1/2'}>
                Découvrez ce qu'est vraiment une vie de <span className={'text-orange font-bold'}>quartier</span>
            </p>
        </div>
    );
}
