import { Ticket } from '../domain/tickets.model';
import { TicketsAdapter } from '../adapters/tickets.adapter';
import { TicketsRepository } from '../domain/tickets.abstract.repository';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';
import { TicketPriorityEnum } from '../../../core/entities/ticket-priority.enum';

export class TicketsService {
    constructor(private ticketsRepository: TicketsRepository) {}

    public async getTickets(status: TicketStatusEnum | null, priority: TicketPriorityEnum | null): Promise<Ticket[]> {
        if (!status || !Object.values(TicketStatusEnum).includes(status)) {
            status = null;
        }
        if (!priority || !Object.values(TicketPriorityEnum).includes(priority)) {
            priority = null;
        }
        
        const tickets = await this.ticketsRepository.getTickets(status, priority);
        return TicketsAdapter.listEntityToDomain(tickets);
    }
}
