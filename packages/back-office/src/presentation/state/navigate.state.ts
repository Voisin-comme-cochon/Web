import {useNavigate} from 'react-router-dom';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate('/');
    const goDashboard = () => navigate('/dashboard');
    const goNeighborhoodDetail = (id: string | number) => navigate('/neighborhood-detail?id=' + id);

    return {
        goLogin,
        goDashboard,
        goNeighborhoodDetail,
    };
};
