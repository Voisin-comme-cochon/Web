import axios from 'axios';
import { AuthRepository } from '@/infrastructure/repositories/AuthRepository.ts';

const ApiService = axios.create({
    baseURL: import.meta.env.VITE_VCC_API_URL || 'http://localhost:3000',
    withCredentials: true,
});

ApiService.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

ApiService.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const authRepository = new AuthRepository();

        if (
            error.response?.status === 403 &&
            !originalRequest._retry // empêcher boucle infinie
        ) {
            console.log('Token expiré, tentative de rafraîchissement...');
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token') || '';
            try {
                const tokens = await authRepository.refreshAccessToken(refreshToken);
                originalRequest.headers['Authorization'] = `Bearer ${tokens.access_token}`;
                return ApiService(originalRequest);
            } catch {
                await authRepository.logout();
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default ApiService;
