import { Ticket } from '../domain/tickets.model';
import { TicketsAdapter } from '../adapters/tickets.adapter';
import { TicketsRepository } from '../domain/tickets.abstract.repository';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';

export class TicketsService {
    constructor(private ticketsRepository: TicketsRepository) {}

    public async getTickets(status: TicketStatusEnum | null): Promise<Ticket[]> {
        if (!status || !Object.values(TicketStatusEnum).includes(status)) {
            status = null;
        }
        const tickets = await this.ticketsRepository.getTickets(status);
        return TicketsAdapter.listEntityToDomain(tickets);
    }
}
