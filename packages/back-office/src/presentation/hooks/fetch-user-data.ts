import {useEffect} from "react";
import {TabUseCase} from "@/domain/use-cases/tabs.uc.ts";
import {UserModel} from "@/domain/models/user.model.ts";

export const useFetchUserData = (
    setUsers: (n: UserModel[]) => void,
) => {
    const tabUc = new TabUseCase();

    useEffect(() => {
        tabUc.getUsers()
            .then(setUsers)
            .catch(() => setUsers([]));
    }, []);
}
