import { AuthRepository, SignupData } from '@/infrastructure/repositories/AuthRepository.ts';
import { AxiosError } from 'axios';

interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

export class AuthError extends Error {
    description: string;

    constructor(message: string, error?: Error, description = 'Unknown error occurred') {
        super(message);
        this.name = 'AuthError';
        this.description = description;
        this.stack = error?.stack;
    }
}

export class AuthUc {
    constructor(private authRepository: AuthRepository) {}

    public async login(email: string, password: string): Promise<AuthTokens> {
        try {
            const tokens = await this.authRepository.login(email, password);
            localStorage.setItem('jwt', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
            return tokens;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status === 400) {
                    throw new AuthError('Email ou mot de passe invalide.', error);
                } else {
                    throw new AuthError(`Erreur lors de la connexion: ${error.message}`, error);
                }
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
    }

    public async resetPassword(token: string, password: string): Promise<void> {
        try {
            await this.authRepository.resetPassword(token, password);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status === 400) {
                    throw new AuthError(
                        'Token invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.',
                        error
                    );
                } else {
                    throw new AuthError(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`, error);
                }
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
    }

    public async requestPasswordReset(email: string): Promise<void> {
        try {
            await this.authRepository.requestPasswordReset(email);
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new AuthError(
                    `Erreur lors de la demande de réinitialisation du mot de passe: ${error.message}`,
                    error
                );
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
    }

    public async signin(data: SignupData): Promise<AuthTokens> {
        try {
            const tokens = await this.authRepository.signin(data);
            localStorage.setItem('jwt', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
            return tokens;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status === 400) {
                    throw new AuthError("Informations invalides. Veuillez vérifier vos données d'inscription.", error);
                } else if (error.status === 409) {
                    throw new AuthError('Un compte avec cette adresse email existe déjà.', error);
                } else {
                    throw new AuthError(`Erreur lors de l'inscription: ${error.message}`, error);
                }
            }
            throw new AuthError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }
    }
}
