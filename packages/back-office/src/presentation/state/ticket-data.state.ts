import {useState} from "react";
import {TicketModel} from "@/domain/models/ticket.model.ts";

export const useTicketDataState = () => {
    const [tickets, setTickets] = useState<TicketModel[]>();

    return {
        tickets,
        setTickets,
    }
}