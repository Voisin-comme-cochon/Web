import {StatusTicketEnum} from "@/domain/models/status-ticket.enum.ts";
import {TicketPriorityEnum} from "@/domain/models/ticket-priority.enum.ts";

export interface TicketModel {
    id: number;
    subject: string;
    status: StatusTicketEnum;
    priority: TicketPriorityEnum;
    createdAt: Date;
}