import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {DecodedUserModel} from "@/domain/models/decoded-user.model.ts";
import {logout} from "@/infrastructure/repositories/auth.repository.ts";

export const useRedirectIfAuthenticated = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;

            try {
                const decoded: DecodedUserModel = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp > currentTime && decoded.isSuperAdmin) {
                    navigate('/dashboard');
                } else {
                    await logout()
                }
            } catch (e) {
                console.error('Invalid JWT', e);
                await logout()
            }
        }

        check();
    }, [navigate]);
};
