import LoginForm from '@/components/LoginForm/LoginForm.tsx';
import {useRedirectIfAuthenticated} from "@/presentation/hooks/use-redirect-if-authenticated.ts";

export default function LoginPage() {
    useRedirectIfAuthenticated()

    return (
        <div className={'h-[calc(100vh-64px)] flex'}>
            <LoginForm/>
        </div>
    );
}
