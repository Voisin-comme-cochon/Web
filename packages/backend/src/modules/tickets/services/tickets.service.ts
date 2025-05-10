import { Ticket } from '../domain/tickets.model';
import { TicketsAdapter } from '../adapters/tickets.adapter';
import { TicketsRepository } from '../domain/tickets.abstract.repository';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';
import { TicketPriorityEnum } from '../../../core/entities/ticket-priority.enum';

export class TicketsService {
    constructor(private ticketsRepository: TicketsRepository) {}

    public async getTickets(
        status: TicketStatusEnum | null,
        priority: TicketPriorityEnum | null,
        page: number,
        limit: number
    ): Promise<[Ticket[], number]> {
        if (!status || !Object.values(TicketStatusEnum).includes(status)) {
            status = null;
        }
        if (!priority || !Object.values(TicketPriorityEnum).includes(priority)) {
            priority = null;
        }
        const offset = page * limit - limit;
        const [tickets, count] = await this.ticketsRepository.getTickets(status, priority, limit, offset);
        const ticketsDomain = TicketsAdapter.listEntityToDomain(tickets);
        return [ticketsDomain, count];
    }
}
