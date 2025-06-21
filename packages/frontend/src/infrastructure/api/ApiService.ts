import axios from 'axios';
import { logout, refreshAccessToken } from '@/infrastructure/repositories/AuthRepository.ts';

const ApiService = axios.create({
    baseURL: import.meta.env.VITE_VCC_API_URL || 'http://localhost:3000',
    withCredentials: true,
});

// 1 seule promesse de refresh active à la fois
let refreshPromise: Promise<any> | null = null;

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

        // Si 403 (token expiré) et qu'on n'a pas déjà réessayé
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            // 1) Instancie refreshPromise qu'une seule fois
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken()
                    .then((tokens) => {
                        // une fois terminé, on la réinitialise pour permettre
                        // un futur refresh quand celui-ci expirera de nouveau
                        refreshPromise = null;
                        return tokens;
                    })
                    .catch((err) => {
                        refreshPromise = null;
                        throw err;
                    });
            }

            // 2) Quand le refresh est terminé, rejoue la requête
            return refreshPromise
                .then((tokens) => {
                    originalRequest.headers['Authorization'] = `Bearer ${tokens.access_token}`;
                    return ApiService(originalRequest);
                })
                .catch((refreshErr) => {
                    // En cas d'échec (refresh invalide ou autre), on déconnecte
                    logout();
                    window.location.href = '/login';
                    return Promise.reject(refreshErr);
                });
        }

        // Sinon : on propage l'erreur
        return Promise.reject(error);
    }
);

export default ApiService;
