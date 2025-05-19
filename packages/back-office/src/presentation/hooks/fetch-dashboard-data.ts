import {useEffect} from "react";
import {DashboardUseCase} from "@/domain/use-cases/dashboard.uc.ts";

export const useFetchDashboardData = (
    setCreatedTickets: (n: number) => void,
    setOpenTickets: (n: number) => void,
    setClosedTickets: (n: number) => void,
    setCreatedNeighborhood: (n: number) => void,
    setUsers: (n: number) => void,
    setEvents: (n: number) => void,
    setMessages: (n: number) => void,
    setSales: (n: number) => void) => {
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

        dashboardUseCase.getCreatedNeighborhoodAmountData()
            .then(setCreatedNeighborhood)
            .catch(() => setCreatedNeighborhood(0));

        dashboardUseCase.getUsersAmountData()
            .then(setUsers)
            .catch(() => setUsers(0));

        dashboardUseCase.getEventsAmountData()
            .then(setEvents)
            .catch(() => setEvents(0));

        dashboardUseCase.getMessagesAmountData()
            .then(setMessages)
            .catch(() => setMessages(0));

        dashboardUseCase.getSalesAmountData()
            .then(setSales)
            .catch(() => setSales(0));
    });
}