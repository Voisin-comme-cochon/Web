import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {DecodedUser} from "@/domain/models/DecodedUser";

export const useRedirectIfAuthenticated = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return;

        try {
            const decoded: DecodedUser = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp > currentTime && decoded.isSuperAdmin) {
                navigate('/dashboard');
            } else {
                localStorage.removeItem('jwt');
            }
        } catch (e) {
            console.error('Invalid JWT', e);
            localStorage.removeItem('jwt');
        }
    }, [navigate]);
};
