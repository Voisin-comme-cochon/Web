import LoginForm from '@/components/LoginForm/LoginForm.tsx';
import Header from '@/components/Header/Header.tsx';
import AuthFooter from '@/components/AuthFooter/AuthFooter.tsx';

export default function LoginPage() {
    return (
        <>
            <Header />
            <div className={'h-[calc(100vh-64px)] flex items-center justify-center relative'}>
                <LoginForm />
            </div>
            <AuthFooter />
        </>
    );
}
