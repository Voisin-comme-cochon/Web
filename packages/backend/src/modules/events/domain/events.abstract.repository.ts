import { EventEntity } from '../../../core/entities/event.entity';

export abstract class EventsRepository {
    abstract getEvents(limit: number, offset: number): Promise<[EventEntity[], number]>;

    abstract getEventsByNeighborhoodId(id: number, limit: number, offset: number): Promise<[EventEntity[], number]>;
}
