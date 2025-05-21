import {useEffect} from "react";
import {DashboardUseCase} from "@/domain/use-cases/dashboard.uc.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";

export const useGetNeighborhood = (setNeighborhood: (n: PaginatedResultModel<NeighborhoodModel>) => void) => {
    const dashboardUseCase = new DashboardUseCase();

    useEffect(() => {
        dashboardUseCase.getWaitingNeighborhoods()
            .then(setNeighborhood)
            .catch(() => setNeighborhood({} as PaginatedResultModel<NeighborhoodModel>));
    });
}