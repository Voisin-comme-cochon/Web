import { DataSource } from 'typeorm';
import { TicketsRepository } from '../domain/tickets.abstract.repository';
import { TicketEntity } from '../../../core/entities/ticket.entity';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';

export class TicketsRepositoryImplementation implements TicketsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getTickets(status: TicketStatusEnum | null): Promise<TicketEntity[]> {
        return this.dataSource.getRepository(TicketEntity).find({
            where: {
                ...(status ? { status: status } : {}),
            },
        });
    }
}
