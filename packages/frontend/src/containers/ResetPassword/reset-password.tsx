import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import ResetPasswordForm from '@/components/ResetPassword/ResetPasswordForm.tsx';
import RequestResetForm from '@/components/ResetPassword/RequestResetForm.tsx';
import ResetPasswordSuccess from '@/components/ResetPassword/ResetPasswordSuccess.tsx';
import AuthFooter from '@/components/AuthFooter/AuthFooter.tsx';
import MinimalHeader from '@/components/Header/MinimalHeader.tsx';

export default function ResetPasswordPage() {
    const [resetSuccess, setResetSuccess] = useState(false);
    const [, setRequestSuccess] = useState(false);
    const { goLogin } = useAppNavigation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const handleResetSuccess = () => {
        setResetSuccess(true);
    };

    const handleRequestSuccess = () => {
        setRequestSuccess(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <MinimalHeader />

            <main className="flex-1 flex items-center justify-center p-4 md:p-6">
                <Card className="w-full max-w-md border-none shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">
                            {token ? 'Réinitialiser votre mot de passe' : 'Demande de réinitialisation'}
                        </CardTitle>
                        <CardDescription className="text-primary/70">
                            {token
                                ? 'Veuillez créer un nouveau mot de passe sécurisé pour votre compte'
                                : 'Veuillez entrer votre adresse email pour recevoir un lien de réinitialisation'}
                        </CardDescription>
                    </CardHeader>

                    {token ? (
                        resetSuccess ? (
                            <ResetPasswordSuccess onLoginClick={goLogin} />
                        ) : (
                            <ResetPasswordForm onSubmitSuccess={handleResetSuccess} onLoginClick={goLogin} />
                        )
                    ) : (
                        <RequestResetForm onSubmitSuccess={handleRequestSuccess} onLoginClick={goLogin} />
                    )}
                </Card>
            </main>

            <AuthFooter />
        </div>
    );
}
