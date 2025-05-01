import { ApiService } from '@/infrastructure/api/ApiService.ts';

interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

export class LoginSignInFrontRepository {
    constructor(private apiService: ApiService) {}

    async login(email: string, password: string): Promise<AuthTokens> {
        return await this.apiService.post('/auth/login', `{"email": "${email}", "password": "${password}"}`);
    }
}
