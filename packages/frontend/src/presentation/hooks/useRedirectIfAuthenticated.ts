import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { DecodedUser } from '@/domain/models/DecodedUser';
import { Roles } from '@/domain/models/Roles.ts';
import { AuthRepository } from '@/infrastructure/repositories/AuthRepository.ts';

export const useRedirectIfAuthenticated = (minimumRole: Roles = Roles.USER) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem('jwt');

            if (!token) {
                setIsLoading(false);
                navigate('/login');
                return;
            }

            try {
                const decoded = jwtDecode<DecodedUser>(token);
                const currentTime = Date.now() / 1000;
                const timeBuffer = 60;

                if (decoded.exp < currentTime + timeBuffer) {
                    try {
                        const authRepository = new AuthRepository();
                        const refreshToken = localStorage.getItem('refresh_token') || '';
                        const tokens = await authRepository.refreshAccessToken(refreshToken);

                        const newDecoded = jwtDecode<DecodedUser>(tokens.access_token);

                        if (!checkUserPermissions(newDecoded, minimumRole)) {
                            navigate('/login');
                            return;
                        }

                        setIsAuthenticated(true);
                    } catch (refreshError) {
                        console.error('Échec du refresh du token:', refreshError);

                        navigate('/login');
                        return;
                    }
                } else {
                    if (!checkUserPermissions(decoded, minimumRole)) {
                        navigate('/login');
                        return;
                    }

                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Erreur lors du décodage du token:', error);
                localStorage.removeItem('jwt');
                localStorage.removeItem('page');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('neighborhoodId');
                navigate('/login');
                return;
            }

            setIsLoading(false);
        };

        checkAuthentication();
    }, [minimumRole, navigate]);

    const checkUserPermissions = (decoded: DecodedUser, requiredRole: Roles): boolean => {
        if (requiredRole === Roles.ADMIN || requiredRole === Roles.SUPER_ADMIN) {
            return decoded.isSuperAdmin;
        }
        return true;
    };

    return { isLoading, isAuthenticated };
};
