import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate('/login');
    const goSignin = () => navigate('/signin');
    const goResetPassword = () => navigate('/reset-password');
    const goHome = () => navigate('/');

    return {
        goLogin,
        goSignin,
        goHome,
        goResetPassword,
    };
};
