import {useEffect} from "react";
import {DashboardUseCase} from "@/domain/use-cases/dashboard.uc.ts";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";

export const useFetchNeighborhoodData = (
    setNeighborhoods: (n: NeighborhoodModel[]) => void,
) => {
    const dashboardUseCase = new DashboardUseCase();

    useEffect(() => {
        dashboardUseCase.getNeighborhoods(null)
            .then(setNeighborhoods)
            .catch(() => setNeighborhoods([]));
    }, []);
}
