import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate('/login');
    const goSignin = () => navigate('/signin');
    const goResetPassword = () => navigate('/reset-password');
    const goCreateNeighborhood = () => navigate('/neighborhoods/create');
    const goHome = () => navigate('/');
    const goInviteNeighbors = () => navigate('/neighborhoods/invite');

    return {
        goLogin,
        goSignin,
        goHome,
        goResetPassword,
        goCreateNeighborhood,
        goInviteNeighbors,
    };
};
