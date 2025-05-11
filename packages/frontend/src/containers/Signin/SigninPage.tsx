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
            <p className={'text-center text-primary text-base m-4'}>
                Découvrez ce qu'est vraiment une vie de <span className={'text-orange font-bold'}>quartier</span>
            </p>
        </>
    );
}
