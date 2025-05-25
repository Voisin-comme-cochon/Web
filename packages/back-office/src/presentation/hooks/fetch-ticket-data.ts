import {useEffect} from "react";
import {TabUseCase} from "@/domain/use-cases/tabs.uc.ts";
import {TicketModel} from "@/domain/models/ticket.model.ts";

export const useFetchTicketData = (
    setTickets: (n: TicketModel[]) => void,
) => {
    const tabUc = new TabUseCase();

    useEffect(() => {
        tabUc.getTickets(null)
            .then(setTickets)
            .catch(() => setTickets([]));
    }, []);
}
