import {useNavigate} from 'react-router-dom';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate('/');
    const goDashboard = () => navigate('/dashboard');

    return {
        goLogin,
        goDashboard,
    };
};
