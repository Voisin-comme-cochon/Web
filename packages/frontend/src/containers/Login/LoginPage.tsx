import LoginForm from '@/components/LoginForm/LoginForm.tsx';
import AuthFooter from '@/components/AuthFooter/AuthFooter.tsx';
import MinimalHeader from '@/components/Header/MinimalHeader.tsx';

export default function LoginPage() {
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');

    return (
        <>
            <MinimalHeader />
            <div className={'h-[calc(100vh-64px)] flex items-center justify-center relative'}>
                <LoginForm redirect={redirect} />
            </div>
            <AuthFooter />
        </>
    );
}
