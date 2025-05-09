import { TicketEntity } from '../../../core/entities/ticket.entity';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';

export abstract class TicketsRepository {
    abstract getTickets(status: TicketStatusEnum | null): Promise<TicketEntity[]>;
}
