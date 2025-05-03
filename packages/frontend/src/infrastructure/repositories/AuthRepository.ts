import { ApiService } from '@/infrastructure/api/ApiService.ts';

interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

export interface SignupData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    password: string;
    profileImage?: string;
}

export class AuthRepository {
    constructor(private apiService: ApiService) {}

    async signup(data: SignupData): Promise<AuthTokens> {
        return await this.apiService.post('/auth/register', JSON.stringify(data));
    }

    async login(email: string, password: string): Promise<AuthTokens> {
        return await this.apiService.post(
            '/auth/login',
            JSON.stringify({
                email,
                password,
            })
        );
    }

    async resetPassword(token: string, password: string): Promise<void> {
        await this.apiService.post(
            '/auth/reset-password',
            JSON.stringify({
                token,
                password,
            })
        );
    }

    async requestPasswordReset(email: string): Promise<void> {
        await this.apiService.post(
            '/auth/forgot-password',
            JSON.stringify({
                email,
            })
        );
    }
}
