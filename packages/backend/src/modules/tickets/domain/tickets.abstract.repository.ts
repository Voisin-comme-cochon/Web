import { TicketEntity } from '../../../core/entities/ticket.entity';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';
import { TicketPriorityEnum } from '../../../core/entities/ticket-priority.enum';

export abstract class TicketsRepository {
    abstract getTickets(status: TicketStatusEnum | null, priority: TicketPriorityEnum | null): Promise<TicketEntity[]>;
}
