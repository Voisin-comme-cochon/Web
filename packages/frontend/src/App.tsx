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
import NeighborhoodMaterialsPage from '@/containers/NeighborhoodMaterials/NeighborhoodMaterialsPage.tsx';
import CreateEventPage from '@/containers/CreateEvent/CreateEventPage.tsx';
import JoinNeighborhood from '@/containers/JoinNeighborhood/JoinNeighborhood.tsx';
import NeighborhoodDetails from '@/containers/NeighborhoodDetails/NeighborhoodDetails.tsx';
import ManageNeighborhood from '@/containers/ManageNeighborhood/ManageNeighborhood.tsx';
import ProfilPage from '@/containers/ProfilPage/ProfilPage.tsx';

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
                <Route path="/neighborhood-materials" element={<NeighborhoodMaterialsPage />} />
                <Route path="/neighborhoods/invite/:token" element={<NeighborhoodInvitation />} />
                <Route path="/events/create" element={<CreateEventPage />} />
                <Route path="/join-neighborhoods" element={<JoinNeighborhood />} />
                <Route path={'/neighborhood/details/:neighborhoodId'} element={<NeighborhoodDetails />} />
                <Route path={'/neighborhood-manage'} element={<ManageNeighborhood />} />
                <Route path={'/user/:userId'} element={<ProfilPage />} />
            </Routes>
        </Router>
    );
}
