import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput.tsx";
import {usePassword} from "@/presentation/hooks/usePassword.ts";
import {LoginUc} from "@/domain/use-cases/loginUc.ts";
import {LoginSignInFrontRepository} from "@/infrastructure/repositories/LoginSignInFrontRepository.ts";
import {ApiService} from "@/infrastructure/api/ApiService.ts";
import {useInput} from "@/presentation/hooks/useInput.ts";


export default function LoginForm() {
    const {
        password,
        setPassword
    } = usePassword();

    const {
        inputValue,
        setInputValue
    } = useInput();

    const handleSubmit = async () => {
        const loginUc = new LoginUc(new LoginSignInFrontRepository(
            new ApiService()
        ))
        const result = await loginUc.execute(inputValue, password)
        console.log(result)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    return (
        <div className={"w-full flex items-center justify-center"}>
            <Card className="w-full max-w-md shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Connexion</CardTitle>
                    <CardDescription className={"text-xs text-gray-600"}>Entrez vos identifiants pour accéder à
                        votre compte</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <Label htmlFor="email" className={"font-bold"}>Adresse email</Label>
                            <Input id="email" type="email" placeholder="exemple@mail.com" onChange={handleChange}
                                   required/>
                        </div>
                        <PasswordInput value={password} onChangeCallback={setPassword}/>

                        <div>
                            <Button type="submit" className="w-full" variant={"orange"} onClick={handleSubmit}>Se
                                connecter</Button>
                            <Button
                                variant="link"
                                className="text-orange hover:underline w-full text-xs mt-2"
                                type="button"
                            >
                                Mot de passe oublié ?
                            </Button>
                        </div>
                        <div className="flex text-sm justify-center items-center">
                            <p className={"text-gray-600 mr-2"}>
                                Pas encore de compte ?
                            </p>
                            <Button
                                variant="link"
                                className="text-orange hover:underline px-0"
                                type="button"
                            >
                                Créer un compte
                            </Button>

                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
