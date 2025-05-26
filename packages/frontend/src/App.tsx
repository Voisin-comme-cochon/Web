import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from '@/containers/LandingPage/LandingPage.tsx';
import LoginPage from '@/containers/Login/LoginPage.tsx';
import ResetPasswordPage from '@/containers/ResetPassword/reset-password.tsx';
import SigninPage from '@/containers/Signin/SigninPage.tsx';
import { CreateNeighborhood } from '@/containers/Neighborhood/CreateNeighborhood.tsx';
import NeighborhoodInvitation from '@/containers/NeighborhoodInvitation/NeighborhoodInvitation.tsx';
import HomePage from '@/containers/Home/Home.tsx';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signin" element={<SigninPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/neighborhoods/create" element={<CreateNeighborhood />} />
                <Route path="/neighborhoods/invite/:invitationId" element={<NeighborhoodInvitation />} />
            </Routes>
        </Router>
    );
}
