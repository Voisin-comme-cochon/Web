import {useState} from "react";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {TicketModel} from "@/domain/models/ticket.model.ts";
import {PaginatedResultModel} from "@/domain/models/paginated-result.model.ts";

export const useDashboardDataState = () => {
    const [createdTickets, setCreatedTickets] = useState(0);
    const [openTickets, setOpenTickets] = useState(0);
    const [resolvedTickets, setResolvedTickets] = useState(0);
    const [createdNeighborhood, setCreatedNeighborhood] = useState(0);
    const [users, setUsers] = useState(0);
    const [events, setEvents] = useState(0);
    const [messages, setMessages] = useState(0);
    const [sales, setSales] = useState(0);
    const [neighborhoods, setNeighborhoods] = useState<PaginatedResultModel<NeighborhoodModel>>();
    const [tickets, setTickets] = useState<PaginatedResultModel<TicketModel>>();

    return {
        resolvedTickets,
        setResolvedTickets,
        openTickets,
        setOpenTickets,
        createdTickets,
        setCreatedTickets,
        createdNeighborhood,
        setCreatedNeighborhood,
        users,
        setUsers,
        events,
        setEvents,
        messages,
        setMessages,
        sales,
        setSales,
        neighborhoods,
        setNeighborhoods,
        tickets,
        setTickets,
    }
}