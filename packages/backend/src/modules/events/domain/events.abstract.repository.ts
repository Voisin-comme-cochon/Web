import { EventEntity } from '../../../core/entities/event.entity';
import { User } from '../../users/domain/user.model';

export abstract class EventsRepository {
    abstract getEvents(limit: number, offset: number): Promise<[EventEntity[], number]>;

    abstract getEventsByNeighborhoodId(id: number, limit: number, offset: number): Promise<[EventEntity[], number]>;

    abstract getUsersByEventId(id: number, limit: number, offset: number): Promise<[User[], number]>;

    abstract createEvent(event: EventEntity): Promise<EventEntity>;

    abstract getEventById(id: number): Promise<EventEntity | null>;

    abstract getUsersByEventIdNoLimit(id: number): Promise<User[]>;

    abstract registerUserForEvent(id: number, userId: number): void;

    abstract unregisterUserFromEvent(id: number, userId: number): void;

    abstract getEventsByUserId(userId: number): Promise<EventEntity[]>;
}
