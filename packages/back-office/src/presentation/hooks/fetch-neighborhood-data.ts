import {useEffect} from "react";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {TabUseCase} from "@/domain/use-cases/tabs.uc.ts";

export const useFetchNeighborhoodData = (
    setNeighborhoods: (n: NeighborhoodModel[]) => void,
) => {
    const tabUseCase = new TabUseCase();

    useEffect(() => {
        tabUseCase.getNeighborhoods(null)
            .then(setNeighborhoods)
            .catch(() => setNeighborhoods([]));
    }, []);
}
