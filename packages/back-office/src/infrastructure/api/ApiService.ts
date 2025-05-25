import axios from 'axios';
import {logout, refreshAccessToken} from '../repositories/auth.repository.ts';

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

        if (
            error.response?.status === 403 &&
            !originalRequest._retry // empêcher boucle infinie
        ) {
            originalRequest._retry = true;
            try {
                const tokens = await refreshAccessToken();
                originalRequest.headers['Authorization'] = `Bearer ${tokens.access_token}`;
                return ApiService(originalRequest);
            } catch {
                logout();
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default ApiService;
