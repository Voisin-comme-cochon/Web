import {useState} from "react";

export const usePassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    return {
        password,
        setPassword,
        showPassword,
        toggleShowPassword: () => setShowPassword((prev) => !prev),
    }
}