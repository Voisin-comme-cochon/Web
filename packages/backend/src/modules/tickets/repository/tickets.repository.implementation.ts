import { DataSource } from 'typeorm';
import { TicketsRepository } from '../domain/tickets.abstract.repository';
import { TicketEntity } from '../../../core/entities/ticket.entity';
import { TicketStatusEnum } from '../../../core/entities/ticket-status.enum';
import { TicketPriorityEnum } from '../../../core/entities/ticket-priority.enum';

export class TicketsRepositoryImplementation implements TicketsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getTickets(
        status: TicketStatusEnum | null,
        priority: TicketPriorityEnum | null,
        limit: number,
        offset: number
    ): Promise<[TicketEntity[], number]> {
        const qb = this.dataSource.getRepository(TicketEntity).createQueryBuilder('ticket');
        if (status !== null) {
            qb.andWhere('ticket.status = :status', { status });
        }
        if (priority !== null) {
            qb.andWhere('ticket.priority = :priority', { priority });
        }
        qb.skip(offset);
        qb.take(limit);
        return qb.getManyAndCount();
    }
}
