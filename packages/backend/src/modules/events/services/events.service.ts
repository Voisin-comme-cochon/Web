import { Geography } from 'typeorm';
import { CreateEventInput, Event } from '../domain/events.model';
import { EventsAdapter } from '../adapters/events.adapter';
import { EventsRepository } from '../domain/events.abstract.repository';
import { User } from '../../users/domain/user.model';
import { CochonError } from '../../../utils/CochonError';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { EventEntity } from '../../../core/entities/event.entity';

export class EventsService {
    constructor(
        private eventRepository: EventsRepository,
        private readonly objectStorageService: ObjectStorageService
    ) {}

    public async getEvents(page: number, limit: number): Promise<[Event[], number]> {
        const offset = page * limit - limit;
        const [events, count] = await this.eventRepository.getEvents(limit, offset);
        const domainEvents = EventsAdapter.listEntityToDomain(events);
        const eventsWithLinks = await this.replacePhotosByLinks(domainEvents);
        return [eventsWithLinks, count];
    }

    public async getEventsByNeighnorhoodId(id: number, page: number, limit: number): Promise<[Event[], number]> {
        const offset = page * limit - limit;
        const [events, count] = await this.eventRepository.getEventsByNeighborhoodId(id, limit, offset);
        const domainEvents = EventsAdapter.listEntityToDomain(events);
        const eventsWithLinks = await this.replacePhotosByLinks(domainEvents);
        return [eventsWithLinks, count];
    }

    public async getUsersByEventId(id: number, page: number, limit: number): Promise<[User[], number]> {
        const offset = page * limit - limit;
        const [users, count] = await this.eventRepository.getUsersByEventId(id, limit, offset);
        return [users, count];
    }

    public async createEvent(event: CreateEventInput): Promise<Event> {
        const {
            name,
            description,
            neighborhoodId,
            tagId,
            addressStart,
            addressEnd,
            createdBy,
            dateStart,
            dateEnd,
            min,
            max,
            photo,
        } = event;

        if (new Date(dateStart) < new Date() || new Date(dateEnd) < new Date()) {
            throw new CochonError('invalid_date', 'The start and end dates must be in the future', 400);
        }

        const photoUrl = await this.createAndUploadEventImageEntities(photo);

        const prevLink = await this.objectStorageService.getFileLink(photoUrl, BucketType.EVENT_IMAGES);

        const eventEntity = new EventEntity();
        eventEntity.createdBy = createdBy;
        eventEntity.neighborhoodId = neighborhoodId;
        eventEntity.name = name;
        eventEntity.description = description;
        eventEntity.createdAt = new Date();
        eventEntity.dateStart = dateStart;
        eventEntity.dateEnd = dateEnd;
        eventEntity.tagId = tagId;
        eventEntity.min = min;
        eventEntity.max = max;
        eventEntity.photo = photoUrl;

        if (addressStart) {
            eventEntity.addressStart = this.parseGeo(addressStart);
        }
        if (addressEnd) {
            eventEntity.addressEnd = this.parseGeo(addressEnd);
        }

        const createdEvent = await this.eventRepository.createEvent(eventEntity);
        createdEvent.photo = prevLink;
        return EventsAdapter.entityToDomain(createdEvent);
    }

    private async replacePhotoByLink(event: Event): Promise<Event> {
        if (event.photo) {
            event.photo = await this.objectStorageService.getFileLink(event.photo, BucketType.EVENT_IMAGES);
        }
        return event;
    }

    private async replacePhotosByLinks(events: Event[]): Promise<Event[]> {
        return Promise.all(events.map((event) => this.replacePhotoByLink(event)));
    }

    private async createAndUploadEventImageEntities(file: Express.Multer.File): Promise<string> {
        return await this.objectStorageService.uploadFile(file.buffer, file.originalname, BucketType.EVENT_IMAGES);
    }

    private parseGeo(geo: string): Geography {
        try {
            return JSON.parse(geo) as Geography;
        } catch (err) {
            if (err instanceof SyntaxError) {
                throw new CochonError('invalid_geo', 'Invalid geo format', 400);
            }
            throw new CochonError('geo_parsing_error', 'Error parsing geo', 500);
        }
    }
}
