import { Event } from '../domain/events.model';
import { ResponseEventDto } from '../controllers/dto/events.dto';
import { EventEntity } from '../../../core/entities/event.entity';
import { ResponseUserDto } from '../../users/controllers/dto/users.dto';
import { ResponseNeighborhoodDto } from '../../neighborhoods/controllers/dto/neighborhood.dto';
import { ResponseTagDto } from '../../tags/controllers/dto/tags.dto';

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
            min: event.min,
            max: event.max,
            photo: event.photo,
            addressStart: event.addressStart,
            addressEnd: event.addressEnd,
        };
    }

    static domainToResponseEvent(
        event: Event,
        tag: ResponseTagDto,
        neighborhood: ResponseNeighborhoodDto,
        user: ResponseUserDto
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
            photo: event.photo,
            addressStart: event.addressStart,
            addressEnd: event.addressEnd,
        };
    }

    static listDomainToResponseEvent(
        events: Event[],
        tags: ResponseTagDto[],
        neighborhoods: ResponseNeighborhoodDto[],
        users: ResponseUserDto[]
    ): ResponseEventDto[] {
        return events.map((event, index) =>
            this.domainToResponseEvent(event, tags[index], neighborhoods[index], users[index])
        );
    }
}
