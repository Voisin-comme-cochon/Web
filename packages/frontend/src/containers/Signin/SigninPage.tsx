import AuthFooter from '@/components/AuthFooter/AuthFooter.tsx';
import SigninForm from '@/components/SigninForm/SigninForm';
import Header from '@/components/Header/Header.tsx';

export default function SigninPage() {
    return (
        <>
            <Header />
            <div className={'h-[calc(100vh-64px)] flex items-center justify-center relative'}>
                <main className="flex-1 flex items-center justify-center p-4 md:p-6">
                    <SigninForm />
                </main>
            </div>
            <AuthFooter />
        </>
    );
}
