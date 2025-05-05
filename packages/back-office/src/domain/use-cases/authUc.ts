import {AuthTokens} from "@/domain/models/AuthTokens.ts";
import {AuthError} from "../../../../common/errors/AuthError.ts";
import {DecodedUser} from "@/domain/models/DecodedUser.ts";
import {jwtDecode} from "jwt-decode";
import {login} from "@/infrastructure/repositories/AuthRepository.ts";
import {ApiError} from "@/shared/errors/ApiError.ts";

export class AuthUc {
    constructor() {
    }

    public async login(email: string, password: string): Promise<AuthTokens> {
        try {
            const tokens = await login(email, password);
            localStorage.setItem('jwt', tokens.access_token);
            return tokens;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new AuthError(
                        'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.',
                        error as Error
                    );
                } else if ((error as ApiError).status >= 500) {
                    throw new AuthError('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.', error as ApiError);
                } else {
                    throw new AuthError(`Erreur lors de la connexion: ${(error as Error).message}`, error as ApiError);
                }
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async decodeToken(token: string): Promise<DecodedUser> {
        return jwtDecode<DecodedUser>(token);
    }

}
