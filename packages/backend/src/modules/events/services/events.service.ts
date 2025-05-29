import { Event } from '../domain/events.model';
import { EventsAdapter } from '../adapters/events.adapter';
import { EventsRepository } from '../domain/events.abstract.repository';
import { User } from '../../users/domain/user.model';

export class EventsService {
    constructor(private eventRepository: EventsRepository) {}

    public async getEvents(page: number, limit: number): Promise<[Event[], number]> {
        const offset = page * limit - limit;
        const [events, count] = await this.eventRepository.getEvents(limit, offset);
        const domainEvents = EventsAdapter.listEntityToDomain(events);
        return [domainEvents, count];
    }

    public async getEventsByNeighnorhoodId(id: number, page: number, limit: number): Promise<[Event[], number]> {
        const offset = page * limit - limit;
        const [events, count] = await this.eventRepository.getEventsByNeighborhoodId(id, limit, offset);
        const domainEvents = EventsAdapter.listEntityToDomain(events);
        return [domainEvents, count];
    }

    public async getUsersByEventId(id: number, page: number, limit: number): Promise<[User[], number]> {
        const offset = page * limit - limit;
        const [users, count] = await this.eventRepository.getUsersByEventId(id, limit, offset);
        return [users, count];
    }
}
