import {AuthRepository} from '@/infrastructure/repositories/AuthRepository.ts';
import {ApiError} from "@/infrastructure/api/ApiService.ts";
import {AuthTokens} from "@/domain/models/AuthTokens.ts";
import {AuthError} from "../../../../common/errors/AuthError.ts";
import {DecodedUser} from "@/domain/models/DecodedUser.ts";
import {jwtDecode} from "jwt-decode";

export class AuthUc {
    constructor(private authRepo: AuthRepository) {
    }

    public async login(email: string, password: string): Promise<AuthTokens> {
        try {
            const tokens = await this.authRepo.login(email, password);
            localStorage.setItem('jwt', tokens.access_token);
            return tokens;
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    throw new AuthError(
                        'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.',
                        error
                    );
                } else if (error.status >= 500) {
                    throw new AuthError('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.', error);
                } else {
                    throw new AuthError(`Erreur lors de la connexion: ${error.message}`, error);
                }
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
    }

    public async decodeToken(token: string): Promise<DecodedUser> {
        return jwtDecode<DecodedUser>(token);
    }

}
