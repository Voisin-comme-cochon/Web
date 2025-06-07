import { DataSource } from 'typeorm';
import { EventsRepository } from '../domain/events.abstract.repository';
import { EventEntity } from '../../../core/entities/event.entity';
import { EventRegistrationEntity } from '../../../core/entities/event-registration.entity';
import { User } from '../../users/domain/user.model';

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

    public getUsersByEventId(id: number, limit: number, offset: number): Promise<[User[], number]> {
        return this.dataSource
            .getRepository(EventRegistrationEntity)
            .findAndCount({
                where: { eventId: id },
                relations: ['user'],
                skip: offset,
                take: limit,
            })
            .then(([registrations, count]) => {
                const users = registrations
                    .map((registration) => registration.user)
                    .filter((user): user is User => user !== undefined);
                return [users, count];
            });
    }

    public getUsersByEventIdNoLimit(id: number): Promise<User[]> {
        return this.dataSource
            .getRepository(EventRegistrationEntity)
            .find({
                where: { eventId: id },
                relations: ['user'],
            })
            .then((registrations) => {
                return registrations
                    .map((registration) => registration.user)
                    .filter((user): user is User => user !== undefined);
            });
    }

    public registerUserForEvent(id: number, userId: number): void {
        void this.dataSource.getRepository(EventRegistrationEntity).save({
            eventId: id,
            userId: userId,
        });
    }

    public unregisterUserFromEvent(id: number, userId: number): void {
        void this.dataSource.getRepository(EventRegistrationEntity).delete({
            eventId: id,
            userId: userId,
        });
    }

    public createEvent(event: EventEntity): Promise<EventEntity> {
        return this.dataSource.getRepository(EventEntity).save(event);
    }

    public getEventById(id: number): Promise<EventEntity | null> {
        return this.dataSource.getRepository(EventEntity).findOne({
            where: { id },
            relations: ['creator', 'neighborhood', 'tag'],
        });
    }
}
