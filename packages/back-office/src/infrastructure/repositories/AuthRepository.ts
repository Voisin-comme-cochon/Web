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
    return data;
}

export async function refreshAccessToken(): Promise<string> {
    const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) throw new Error('Refresh token failed');

    const data: AuthTokensModel = await response.json();
    return data.access_token;
}

export async function logout() {
    const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/auth/refresh-token`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) throw new Error('Logout failed');

    localStorage.removeItem('jwt');
}