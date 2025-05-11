import { Event } from '../domain/events.model';
import { EventsAdapter } from '../adapters/events.adapter';
import { EventsRepository } from '../domain/events.abstract.repository';

export class EventsService {
    constructor(private eventRepository: EventsRepository) {}

    public async getEvents(page: number, limit: number): Promise<[Event[], number]> {
        const offset = page * limit - limit;
        const [events, count] = await this.eventRepository.getEvents(limit, offset);
        const domainEvents = EventsAdapter.listEntityToDomain(events);
        return [domainEvents, count];
    }
}
