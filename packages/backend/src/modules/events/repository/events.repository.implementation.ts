import { DataSource } from 'typeorm';
import { EventsRepository } from '../domain/events.abstract.repository';
import { EventEntity } from '../../../core/entities/event.entity';

export class EventsRepositoryImplementation implements EventsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getEvents(limit: number, offset: number): Promise<[EventEntity[], number]> {
        return this.dataSource.getRepository(EventEntity).findAndCount({
            skip: offset,
            take: limit,
        });
    }

    public getEventsByNeighborhoodId(id: number, limit: number, offset: number): Promise<[EventEntity[], number]> {
        return this.dataSource.getRepository(EventEntity).findAndCount({
            where: { neighborhoodId: id },
            skip: offset,
            take: limit,
        });
    }
}
