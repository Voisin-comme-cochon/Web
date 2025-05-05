import {AuthRepository} from '@/infrastructure/repositories/AuthRepository.ts';
import {ApiError} from "@/infrastructure/api/ApiService.ts";
import {AuthTokens} from "@/domain/models/AuthTokens.ts";
import {AuthError} from "../../../../common/errors/AuthError.ts";

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

    public async resetPassword(token: string, password: string): Promise<void> {
        try {
            await this.authRepo.resetPassword(token, password);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    throw new AuthError(
                        'Token invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.',
                        error
                    );
                } else if (error.status >= 500) {
                    throw new AuthError('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.', error);
                } else {
                    throw new AuthError(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`, error);
                }
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
    }

    public async requestPasswordReset(email: string): Promise<void> {
        try {
            await this.authRepo.requestPasswordReset(email);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    throw new AuthError('Email invalide. Veuillez vérifier votre adresse email.', error);
                } else if (error.status >= 500) {
                    throw new AuthError('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.', error);
                } else {
                    throw new AuthError(`Erreur lors de la demande de réinitialisation: ${error.message}`, error);
                }
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
    }
}
