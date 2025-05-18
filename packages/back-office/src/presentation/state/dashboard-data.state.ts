import {useState} from "react";

export const useDashboardDataState = () => {
    const [createdTickets, setCreatedTickets] = useState(0);
    const [openTickets, setOpenTickets] = useState(0);
    const [resolvedTickets, setResolvedTickets] = useState(0);

    return {
        resolvedTickets,
        setResolvedTickets,
        openTickets,
        setOpenTickets,
        createdTickets,
        setCreatedTickets,
    }
}