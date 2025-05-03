import AuthFooter from '@/components/AuthFooter/AuthFooter.tsx';
import SigninForm from '@/components/Signin/SigninForm.tsx';
import Header from '@/components/Header/Header.tsx';

export default function SigninPage() {
    return (
        <>
            <Header />
            <div className={''}>
                <main className="flex-1 flex items-center justify-center p-4 md:p-6">
                    <SigninForm />
                </main>
            </div>
            <AuthFooter />
        </>
    );
}
