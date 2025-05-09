import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';
import { TicketPriorityEnum } from '../../../core/entities/ticket-priority.enum';

export class Ticket {
    id!: number;
    subject!: string;
    userId!: number;
    status!: TicketStatusEnum;
    priority!: TicketPriorityEnum;
    createdAt!: Date;
}
