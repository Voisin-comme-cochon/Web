import { DataSource } from 'typeorm';
import { TicketsRepository } from '../domain/tickets.abstract.repository';
import { TicketEntity } from '../../../core/entities/ticket.entity';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';
import { TicketPriorityEnum } from '../../../core/entities/ticket-priority.enum';

export class TicketsRepositoryImplementation implements TicketsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getTickets(status: TicketStatusEnum | null, priority: TicketPriorityEnum | null): Promise<TicketEntity[]> {
        return this.dataSource.getRepository(TicketEntity).find({
            where: {
                ...(status !== null ? { status: status } : {}),
                ...(priority !== null ? { priority: priority } : {}),
            },
        });
    }
}
