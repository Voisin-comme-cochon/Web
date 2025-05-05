import {ApiService} from "@/infrastructure/api/ApiService.ts";
import {AuthTokens} from "@/domain/models/AuthTokens.ts";

export class AuthRepository {
    constructor(private apiService: ApiService) {
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
