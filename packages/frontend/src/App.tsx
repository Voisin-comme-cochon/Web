import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from '@/containers/LandingPage/LandingPage.tsx';
import LoginPage from '@/containers/Login/LoginPage.tsx';
import ResetPasswordPage from '@/containers/ResetPassword/reset-password.tsx';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
        </Router>
    );
}
