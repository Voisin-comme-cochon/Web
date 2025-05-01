import {
    LoginSignInFrontRepository
} from "@/infrastructure/repositories/LoginSignInFrontRepository.ts";
import { ApiError } from '@/infrastructure/api/ApiService.ts';

interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

export class LoginError extends Error {
    description: string;

    constructor(message: string, error?: Error, description = "Unknown error occurred") {
        super(message);
        this.name = 'LoginError';
        this.description = description;
        this.stack = error?.stack;
    }
}

export class LoginUc {
    constructor(
        private loginRepo: LoginSignInFrontRepository
    ) {
    }

    public async execute(
        email: string,
        password: string,
    ): Promise<AuthTokens> {
        try {
            const tokens = await this.loginRepo.login(email, password);
            localStorage.setItem("jwt", tokens.access_token);
            return tokens;
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    throw new LoginError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.", error);
                } else if (error.status >= 500) {
                    throw new LoginError("Le serveur a rencontré une erreur. Veuillez réessayer plus tard.", error);
                } else {
                    throw new LoginError(`Erreur lors de la connexion: ${ error.message }`, error);
                }
            }
            throw new LoginError("Une erreur inattendue est survenue. Veuillez réessayer plus tard.");
        }
    }
}
