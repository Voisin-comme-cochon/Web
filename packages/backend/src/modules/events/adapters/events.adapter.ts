import { Event } from '../domain/events.model';
import { ResponseEventDto, ResponseEventWithUsersDto } from '../controllers/dto/events.dto';
import { EventEntity } from '../../../core/entities/event.entity';
import { ResponseUserDto } from '../../users/controllers/dto/users.dto';
import { ResponseNeighborhoodDto } from '../../neighborhoods/controllers/dto/neighborhood.dto';
import { TagDto } from '../../tags/controllers/dto/tags.dto';

export class EventsAdapter {
    static entityToDomain(eventEntity: EventEntity): Event {
        return {
            id: eventEntity.id,
            createdBy: eventEntity.createdBy,
            neighborhoodId: eventEntity.neighborhoodId,
            name: eventEntity.name,
            description: eventEntity.description,
            createdAt: eventEntity.createdAt,
            dateStart: eventEntity.dateStart,
            dateEnd: eventEntity.dateEnd,
            tagId: eventEntity.tagId,
            type: eventEntity.type,
            min: eventEntity.min,
            max: eventEntity.max,
            photo: eventEntity.photo,
            addressStart: eventEntity.addressStart,
            addressEnd: eventEntity.addressEnd,
        };
    }

    static listEntityToDomain(eventEntities: EventEntity[]): Event[] {
        return eventEntities.map((eventEntity) => this.entityToDomain(eventEntity));
    }

    static domainToEntity(event: Event): EventEntity {
        return {
            id: event.id,
            createdBy: event.createdBy,
            neighborhoodId: event.neighborhoodId,
            name: event.name,
            description: event.description,
            createdAt: event.createdAt,
            dateStart: event.dateStart,
            dateEnd: event.dateEnd,
            tagId: event.tagId,
            type: event.type,
            min: event.min,
            max: event.max,
            photo: event.photo,
            addressStart: event.addressStart,
            addressEnd: event.addressEnd,
        };
    }

    static domainToResponseEvent(
        event: Event,
        tag: TagDto,
        neighborhood: ResponseNeighborhoodDto,
        user: ResponseUserDto,
        registeredUsers: number
    ): ResponseEventDto {
        return {
            id: event.id,
            creator: user,
            neighborhood: neighborhood,
            name: event.name,
            description: event.description,
            createdAt: event.createdAt,
            dateStart: event.dateStart,
            dateEnd: event.dateEnd,
            tag: tag,
            min: event.min,
            max: event.max,
            type: event.type,
            photo: event.photo,
            addressStart: event.addressStart,
            addressEnd: event.addressEnd,
            registeredUsers: registeredUsers,
        };
    }

    static domainToResponseEventWithUsers(
        event: Event,
        tag: TagDto,
        neighborhood: ResponseNeighborhoodDto,
        user: ResponseUserDto,
        registeredUsers: ResponseUserDto[]
    ): ResponseEventWithUsersDto {
        return {
            id: event.id,
            creator: user,
            type: event.type,
            neighborhood: neighborhood,
            name: event.name,
            description: event.description,
            createdAt: event.createdAt,
            dateStart: event.dateStart,
            dateEnd: event.dateEnd,
            tag: tag,
            min: event.min,
            max: event.max,
            photo: event.photo,
            addressStart: event.addressStart,
            addressEnd: event.addressEnd,
            registeredUsers: registeredUsers,
        };
    }

    static listDomainToResponseEvent(
        events: Event[],
        tags: TagDto[],
        neighborhoods: ResponseNeighborhoodDto[],
        users: ResponseUserDto[],
        registeredUsers: number[]
    ): ResponseEventDto[] {
        return events.map((event, index) =>
            this.domainToResponseEvent(event, tags[index], neighborhoods[index], users[index], registeredUsers[index])
        );
    }
}
