import {ApiService} from "@/infrastructure/api/ApiService.ts";

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
    description?: string;
    profileImage?: File | string | null;
}

export class AuthRepository {
    constructor(private apiService: ApiService) {
    }

    async signup(data: SignupData): Promise<AuthTokens> {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('address', data.address);
        formData.append('password', data.password);

        if (data.description) {
            formData.append('description', data.description);
        }

        if (data.profileImage) {
            formData.append('profileImage', data.profileImage);
        }

        return await this.apiService.postFormData('/auth/signin', formData);
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
