import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { DecodedUser } from '@/domain/models/DecodedUser';
import { Roles } from '@/domain/models/Roles.ts';

export const useRedirectIfAuthenticated = (minimumRole: Roles = Roles.USER) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            navigate('/login');
            return;
        }
        
        const decoded = jwtDecode<DecodedUser>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            localStorage.removeItem('jwt');
            navigate('/login');
            return;
        }

        if ((minimumRole === Roles.ADMIN || minimumRole === Roles.SUPER_ADMIN) && !decoded.isSuperAdmin) {
            navigate('/dashboard');
        }
    }, [minimumRole, navigate]);
};
