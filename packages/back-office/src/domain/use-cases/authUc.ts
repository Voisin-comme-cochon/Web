import {AuthTokensModel} from "@/domain/models/auth-tokens.model.ts";
import {DecodedUserModel} from "@/domain/models/decoded-user.model.ts";
import {jwtDecode} from "jwt-decode";
import {login} from "@/infrastructure/repositories/auth.repository.ts";
import {ApiError} from "@/shared/errors/ApiError.ts";
import {AuthError} from "@/shared/errors/AuthError";

export class AuthUc {
    constructor() {
    }

    public async login(email: string, password: string): Promise<AuthTokensModel> {
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

    public async decodeToken(token: string): Promise<DecodedUserModel> {
        return jwtDecode<DecodedUserModel>(token);
    }

}
