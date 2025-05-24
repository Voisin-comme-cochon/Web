import {useEffect} from "react";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {NeighborhoodDetailsUseCase} from "@/domain/use-cases/neighborhood-details.uc.ts";

export const useGetNeighborhoodById = (setNeighborhood: (n: NeighborhoodModel | null) => void) => {
    const neighborhoodDetailsUseCase = new NeighborhoodDetailsUseCase();

    useEffect(() => {
        const neighborhoodId = new URLSearchParams(window.location.search).get('id');
        if (neighborhoodId) {
            neighborhoodDetailsUseCase.getNeighborhoodById(neighborhoodId)
                .then(setNeighborhood)
                .catch(() => setNeighborhood(null));
        } else {
            setNeighborhood(null);
        }
    }, []);
}