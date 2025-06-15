import { DataSource, MoreThan } from 'typeorm';
import { EventsRepository } from '../domain/events.abstract.repository';
import { EventEntity } from '../../../core/entities/event.entity';
import { EventRegistrationEntity } from '../../../core/entities/event-registration.entity';
import { User } from '../../users/domain/user.model';
import { UserEntity } from '../../../core/entities/user.entity';
import { UserAdapter } from '../../users/adapters/user.adapter';

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
            where: { neighborhoodId: id, dateStart: MoreThan(new Date()) },
            order: { dateStart: 'ASC' },
            skip: offset,
            take: limit,
        });
    }

    public async getUsersByEventId(id: number, limit: number, offset: number): Promise<[User[], number]> {
        const [registrations, count] = await this.dataSource.getRepository(EventRegistrationEntity).findAndCount({
            where: { eventId: id },
            relations: ['user'],
            skip: offset,
            take: limit,
        });
        const users = registrations
            .map((registration) => registration.user)
            .filter((user): user is UserEntity => user !== undefined);
        return [UserAdapter.listEntityToDomain(users), count];
    }

    public async getUsersByEventIdNoLimit(id: number): Promise<User[]> {
        const registrations = await this.dataSource.getRepository(EventRegistrationEntity).find({
            where: { eventId: id },
            relations: ['user'],
        });
        const users = registrations
            .map((registration) => registration.user)
            .filter((user): user is UserEntity => user !== undefined);
        return UserAdapter.listEntityToDomain(users);
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

    public getEventsByUserId(userId: number): Promise<EventEntity[]> {
        return this.dataSource
            .getRepository(EventRegistrationEntity)
            .createQueryBuilder('registration')
            .leftJoinAndSelect('registration.event', 'event')
            .where('registration.userId = :userId', { userId })
            .getMany()
            .then((registrations) =>
                registrations
                    .map((registration) => registration.event)
                    .filter((event): event is EventEntity => event !== undefined)
            );
    }

    public async deleteEvent(id: number): Promise<void> {
        await this.dataSource.getRepository(EventEntity).delete({ id });
    }
}
