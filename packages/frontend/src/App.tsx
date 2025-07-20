import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from '@/containers/LandingPage/LandingPage.tsx';
import LoginPage from '@/containers/Login/LoginPage.tsx';
import ResetPasswordPage from '@/containers/ResetPassword/reset-password.tsx';
import SigninPage from '@/containers/Signin/SigninPage.tsx';
import { CreateNeighborhood } from '@/containers/Neighborhood/CreateNeighborhood.tsx';
import NeighborhoodInvitation from '@/containers/NeighborhoodInvitation/NeighborhoodInvitation.tsx';
import EventDetails from '@/containers/EventDetails/EventDetails.tsx';
import MyNeighborhoodPage from '@/containers/MyNeighborhood/MyNeighborhoodPage.tsx';
import NeighborhoodEventsPage from '@/containers/NeighborhoodEvents/NeighborhoodEventsPage.tsx';
import NeighborhoodJournalPage from '@/containers/NeighborhoodJournal/NeighborhoodJournalPage.tsx';
import CreateEventPage from '@/containers/CreateEvent/CreateEventPage.tsx';
import JoinNeighborhood from '@/containers/JoinNeighborhood/JoinNeighborhood.tsx';
import NeighborhoodDetails from '@/containers/NeighborhoodDetails/NeighborhoodDetails.tsx';
import ManageNeighborhood from '@/containers/ManageNeighborhood/ManageNeighborhood.tsx';
import ProfilPage from '@/containers/ProfilPage/ProfilPage.tsx';
import ItemsPage from '@/containers/Items/ItemsPage.tsx';
import ItemDetailsPage from '@/containers/Items/ItemDetailsPage.tsx';
import AddItemPage from '@/containers/Items/AddItemPage.tsx';
import EditItemPage from '@/containers/Items/EditItemPage.tsx';
import NeighborhoodNewspaperPage from '@/containers/Neighborhood/NeighborhoodNewspaperPage';
import NeighborhoodNewspaperCreatePage from '@/containers/Neighborhood/NeighborhoodNewspaperCreatePage';
import NeighborhoodNewspaperDetailPage from '@/containers/Neighborhood/NeighborhoodNewspaperDetailPage';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signin" element={<SigninPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/neighborhoods/create" element={<CreateNeighborhood />} />
                <Route path={'/events/:eventId'} element={<EventDetails />} />
                <Route path="/my-neighborhood" element={<MyNeighborhoodPage />} />
                <Route path="/neighborhood-events" element={<NeighborhoodEventsPage />} />
                <Route path="/neighborhood-journal" element={<NeighborhoodJournalPage />} />
                <Route path="/neighborhoods/invite/:token" element={<NeighborhoodInvitation />} />
                <Route path="/events/create" element={<CreateEventPage />} />
                <Route path="/join-neighborhoods" element={<JoinNeighborhood />} />
                <Route path={'/neighborhood/details/:neighborhoodId'} element={<NeighborhoodDetails />} />
                <Route path={'/neighborhood-manage'} element={<ManageNeighborhood />} />
                <Route path={'/user/:userId'} element={<ProfilPage />} />
                <Route path={'/items'} element={<ItemsPage />} />
                <Route path={'/items/new'} element={<AddItemPage />} />
                <Route path={'/items/:itemId'} element={<ItemDetailsPage />} />
                <Route path={'/items/:itemId/edit'} element={<EditItemPage />} />
                <Route path="/neighborhood-newspaper" element={<NeighborhoodNewspaperPage />} />
                <Route path="/neighborhood/newspaper/create" element={<NeighborhoodNewspaperCreatePage />} />
                <Route path="/neighborhood/newspaper/:id" element={<NeighborhoodNewspaperDetailPage />} />
            </Routes>
        </Router>
    );
}
