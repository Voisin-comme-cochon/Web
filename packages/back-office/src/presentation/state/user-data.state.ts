import {useState} from "react";
import {UserModel} from "@/domain/models/user.model.ts";

export const useUserDataState = () => {
    const [users, setUsers] = useState<UserModel[]>();

    return {
        users,
        setUsers,
    }
}