import {useEffect} from "react";
import {DashboardUseCase} from "@/domain/use-cases/dashboard.uc.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";
import {TicketModel} from "@/domain/models/ticket.model.ts";

export const useGetTickets = (setTickets: (n: PaginatedResultModel<TicketModel>) => void) => {
    const dashboardUseCase = new DashboardUseCase();

    useEffect(() => {
        dashboardUseCase.getOpenTickets()
            .then(setTickets)
            .catch(() => setTickets({} as PaginatedResultModel<TicketModel>));
    });
}