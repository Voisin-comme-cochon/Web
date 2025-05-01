import LoginForm from "@/components/LoginForm/LoginForm.tsx";
import Header from "@/components/Header/Header.tsx";


export default function LoginPage() {

    return (
        <>
            <Header/>
            <div className={"h-[calc(100vh-64px)] flex items-center justify-center relative"}>
                <LoginForm/>
                <p className={"absolute bottom-4 left-1/2 transform -translate-x-1/2"}>
                    Découvrez ce qu'est vraiment une vie de {" "}
                    <span className={"text-orange font-bold"}>
                    quartier
                    </span>
                </p>
            </div>
        </>
    );
}
