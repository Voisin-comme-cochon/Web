import {useEffect} from "react";
import {NeighborhoodDetailsUseCase} from "@/domain/use-cases/neighborhood-details.uc.ts";
import {UserModel} from "@/domain/models/user.model.ts";

export const useGetUsersByNeighborhood = (setUsers: (n: UserModel[] | null) => void) => {
    const neighborhoodDetailsUseCase = new NeighborhoodDetailsUseCase();

    useEffect(() => {
        const neighborhoodId = new URLSearchParams(window.location.search).get('id');
        if (neighborhoodId) {
            neighborhoodDetailsUseCase.getUsersByNeighborhood(neighborhoodId)
                .then(setUsers)
                .catch(() => setUsers(null));
        } else {
            setUsers(null);
        }
    }, []);
}