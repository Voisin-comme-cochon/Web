import ApiService from '@/infrastructure/api/ApiService.ts';
import { ApiError } from '@/shared/errors/ApiError';
import { AuthTokensModel } from '@/domain/models/auth-tokens.model.ts';

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
    latitude: number;
    longitude: number;
    password: string;
    description?: string;
    profileImage?: File | string | null;
    tags: number[];
}

export class AuthRepository {
    async signin(data: SignupData): Promise<AuthTokens> {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('address', data.address);
        formData.append('latitude', data.latitude.toString());
        formData.append('longitude', data.longitude.toString());
        formData.append('password', data.password);
        formData.append('tagIds', data.tags.join(','));

        if (data.description) {
            formData.append('description', data.description);
        }

        if (data.profileImage) {
            formData.append('profileImage', data.profileImage);
        }

        const response = await ApiService.post('/auth/signin', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    async login(email: string, password: string): Promise<AuthTokens> {
        const response = await ApiService.post('/auth/login', {
            email,
            password,
        });

        if (response.status === 400) {
            throw new ApiError(400, 'Invalid email or password');
        }

        return response.data;
    }

    async resetPassword(token: string, password: string): Promise<void> {
        const response = await ApiService.post(
            '/auth/reset-password',
            JSON.stringify({
                token,
                password,
            })
        );

        if (response.status === 400) {
            throw new ApiError(400, 'Invalid or expired token');
        }

        return response.data;
    }

    async requestPasswordReset(email: string): Promise<void> {
        return await ApiService.post(
            '/auth/forgot-password',
            JSON.stringify({
                email,
            })
        );
    }

    async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
        const response = await ApiService.patch('/auth/refresh', {
            refreshToken,
        });

        if (response.status === 401) {
            throw new ApiError(401, 'Unauthorized');
        }

        return response.data;
    }
}

export async function logout() {
    const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt') || ''}`,
        },
        body: JSON.stringify({
            refreshToken: localStorage.getItem('refresh_token') || '',
        }),
    });

    if (!response.ok) throw new Error('Logout failed');

    localStorage.removeItem('jwt');
    localStorage.removeItem('refresh_token');
}

export async function refreshAccessToken(): Promise<AuthTokensModel> {
    const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/auth/refresh`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt') || ''}`,
        },
        body: JSON.stringify({
            refreshToken: localStorage.getItem('refresh_token') || '',
        }),
    });

    console.log('Refresh token response:', response);

    if (!response.ok) throw new Error('Refresh token failed');

    const data: AuthTokensModel = await response.json();
    localStorage.setItem('jwt', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
}
