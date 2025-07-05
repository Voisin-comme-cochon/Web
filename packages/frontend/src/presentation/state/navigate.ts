import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate('/login');
    const goSignin = (redirect?: string) => navigate('/signin' + (redirect ? `?redirect=${redirect}` : ''));
    const goResetPassword = () => navigate('/reset-password');
    const goCreateNeighborhood = () => navigate('/neighborhoods/create');
    const goLanding = () => navigate('/');
    const goInviteNeighbors = () => navigate('/neighborhoods/invite');
    const goEventDetail = (eventId: number) => navigate(`/events/${eventId}`);
    const goMyNeighborhood = () => navigate('/my-neighborhood');
    const goNeighborhoodEvents = () => navigate('/neighborhood-events');
    const goNeighborhoodJournal = () => navigate('/neighborhood-journal');
    const goNeighborhoodMat = () => navigate('/neighborhood-materials');
    const goCreateEvent = () => navigate('/events/create');
    const goJoinNeighborhood = () => navigate('/join-neighborhoods');
    const goNeighborhoodDetails = (neighborhoodId: string | number) => {
        navigate(`/neighborhood/details/${neighborhoodId}`);
    };
    const goUserProfile = (userId: number | string) => navigate(`/user/${userId}`);
    const goManageNeighborhood = () => navigate('/neighborhood-manage');

    // Items navigation
    const goItems = () => navigate('/items');
    const goItemDetails = (itemId: number) => navigate(`/items/${itemId}`);
    const goAddItem = () => navigate('/items/new');
    const goEditItem = (itemId: number) => navigate(`/items/${itemId}/edit`);

    return {
        goLogin,
        goJoinNeighborhood,
        goSignin,
        goLanding,
        goResetPassword,
        goCreateNeighborhood,
        goInviteNeighbors,
        goEventDetail,
        goMyNeighborhood,
        goNeighborhoodEvents,
        goNeighborhoodJournal,
        goNeighborhoodMat,
        goCreateEvent,
        goNeighborhoodDetails,
        goManageNeighborhood,
        goUserProfile,
        goItems,
        goItemDetails,
        goAddItem,
        goEditItem,
    };
};
