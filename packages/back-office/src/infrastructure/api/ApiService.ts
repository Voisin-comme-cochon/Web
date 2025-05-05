import axios from 'axios';
import {logout, refreshAccessToken} from '../repositories/AuthRepository';

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
            error.response?.status === 401 &&
            !originalRequest._retry // empêcher boucle infinie
        ) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                localStorage.setItem('jwt', newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return ApiService(originalRequest);
            } catch {
                await logout();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default ApiService;
