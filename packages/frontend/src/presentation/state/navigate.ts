import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate('/login');
    const goHome = () => navigate('/');

    return {
        goLogin,
        goHome,
    };
};
