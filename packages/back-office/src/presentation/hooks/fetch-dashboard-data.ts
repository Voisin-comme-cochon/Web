import {useEffect} from "react";
import {DashboardUseCase} from "@/domain/use-cases/dashboard.uc.ts";

export const useFetchDashboardData = (setCreatedTickets: (n: number) => void, setOpenTickets: (n: number) => void, setClosedTickets: (n: number) => void) => {
    const dashboardUseCase = new DashboardUseCase();

    useEffect(() => {
        dashboardUseCase.getCreatedTicketAmountData()
            .then(setCreatedTickets)
            .catch(() => setCreatedTickets(0));

        dashboardUseCase.getOpenTicketAmountData()
            .then(setOpenTickets)
            .catch(() => setOpenTickets(0));

        dashboardUseCase.getResolvedTicketAmountData()
            .then(setClosedTickets)
            .catch(() => setClosedTickets(0));
    }, []);
}