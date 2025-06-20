import {AuthTokensModel} from "@/domain/models/auth-tokens.model.ts";

export async function login(email: string, password: string): Promise<AuthTokensModel> {
    const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/auth/login`,
        {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) throw new Error('Login failed');

    const data: AuthTokensModel = await response.json();
    localStorage.setItem('jwt', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
}

export async function refreshAccessToken(): Promise<AuthTokensModel> {
    const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/auth/refresh`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt') || ''}`,
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

export async function logout() {
    const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt') || ''}`,
        },
        body: JSON.stringify({
            refreshToken: localStorage.getItem('refresh_token') || '',
        }),
    });

    if (!response.ok) throw new Error('Logout failed');

    localStorage.removeItem('jwt');
    localStorage.removeItem('page');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('neighborhoodId');
}