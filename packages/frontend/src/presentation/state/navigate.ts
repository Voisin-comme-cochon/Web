import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate('/login');
    const goSignin = () => navigate('/signin');
    const goResetPassword = () => navigate('/reset-password');
    const goCreateNeighborhood = () => navigate('/neighborhoods/create');
    const goLanding = () => navigate('/');
    const goInviteNeighbors = () => navigate('/neighborhoods/invite');
    const goHome = () => navigate('/home');

    return {
        goLogin,
        goSignin,
        goLanding,
        goResetPassword,
        goCreateNeighborhood,
        goInviteNeighbors,
        goHome,
    };
};
