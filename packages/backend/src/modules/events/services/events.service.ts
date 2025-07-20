import { Geography } from 'typeorm';
import { CreateEventInput, Event, EventType } from '../domain/events.model';
import { EventsAdapter } from '../adapters/events.adapter';
import { EventsRepository } from '../domain/events.abstract.repository';
import { User } from '../../users/domain/user.model';
import { CochonError } from '../../../utils/CochonError';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { EventEntity } from '../../../core/entities/event.entity';
import { MailerService } from '../../mailer/services/mailer.service';
import { NeighborhoodService } from '../../neighborhoods/services/neighborhood.service';
import { TagsService } from '../../tags/services/tags.service';
import { isNull } from '../../../utils/tools';
import { Templates } from '../../mailer/domain/templates.enum';
import { NeighborhoodUserRole } from '../../../core/entities/neighborhood-user.entity';

export class EventsService {
    constructor(
        private eventRepository: EventsRepository,
        private readonly objectStorageService: ObjectStorageService,
        private readonly neighborhoodService: NeighborhoodService,
        private readonly tagsService: TagsService,
        private mailerService: MailerService
    ) {}

    public async getEvents(page: number, limit: number): Promise<[Event[], number]> {
        const offset = page * limit - limit;
        const [events, count] = await this.eventRepository.getEvents(limit, offset);
        const domainEvents = EventsAdapter.listEntityToDomain(events);
        const eventsWithLinks = await this.replacePhotosByLinks(domainEvents);
        return [eventsWithLinks, count];
    }

    public async deleteEvent(id: number, userId: number, reason: string): Promise<void> {
        const event = await this.eventRepository.getEventById(id);

        if (isNull(event)) {
            throw new CochonError('event_not_found', 'Event not found', 404);
        }

        const neighborhood = await this.neighborhoodService.getNeighborhoodById(event.neighborhoodId);

        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        const neighborhoodMembers = neighborhood.neighborhood_users;

        if (
            event.createdBy !== userId &&
            !neighborhoodMembers?.some(
                (member) => member.userId === userId && member.role === NeighborhoodUserRole.ADMIN
            )
        ) {
            throw new CochonError('forbidden_delete', 'You cant delete this event', 403);
        }

        if (event.photo) {
            await this.objectStorageService.deleteFile(event.photo, BucketType.EVENT_IMAGES);
        }

        const registeredUsers = await this.eventRepository.getUsersByEventIdNoLimit(id);

        const creator = registeredUsers.find((user) => user.id === event.createdBy);
        if (!creator) {
            throw new CochonError('creator_not_found', 'Event creator not found in registered users', 404);
        }

        const usersToEmail = registeredUsers.filter((user) => user.id !== creator.id);
        await this.eventRepository.deleteEvent(id);

        await Promise.all(
            usersToEmail.map((user) =>
                this.mailerService.sendRawEmail({
                    to: [user.email],
                    subject: 'Évènement annulé',
                    template: Templates.DELETED_EVENT,
                    context: {
                        eventName: event.name,
                        eventDate: event.dateStart.toLocaleDateString() + ' à ' + event.dateStart.toLocaleTimeString(),
                        userName: user.firstName + ' ' + user.lastName,
                        creatorName: creator.firstName + ' ' + creator.lastName,
                        cancelMessage: reason,
                    },
                })
            )
        );
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

    public async getUsersByEventIdNoLimit(id: number): Promise<User[]> {
        const users = await this.eventRepository.getUsersByEventIdNoLimit(id);
        return users;
    }

    public async getEventById(id: number): Promise<Event> {
        const event = await this.eventRepository.getEventById(id);
        if (!event) {
            throw new CochonError('event_not_found', 'Event not found', 404);
        }
        const domainEvent = EventsAdapter.entityToDomain(event);
        return this.replacePhotoByLink(domainEvent);
    }

    public async registerUserForEvent(id: number, userId: number): Promise<void> {
        const event = await this.eventRepository.getEventById(id);
        if (!event) {
            throw new CochonError('event_not_found', 'Event not found', 404);
        }

        if (event.dateStart < new Date()) {
            throw new CochonError(
                'event_already_started',
                'Cannot register for an event that has already started',
                400
            );
        }

        const registeredAmount = await this.eventRepository.getUsersByEventIdNoLimit(id);
        if (registeredAmount.length >= event.max) {
            throw new CochonError('event_full', 'Event is already full', 400);
        }

        if (registeredAmount.some((user) => user.id === userId)) {
            throw new CochonError('user_already_registered', 'User is already registered for this event', 400);
        }

        this.eventRepository.registerUserForEvent(id, userId);
    }

    public async unregisterUserFromEvent(id: number, userId: number): Promise<void> {
        const event = await this.eventRepository.getEventById(id);
        if (!event) {
            throw new CochonError('event_not_found', 'Event not found', 404);
        }

        const registeredUsers = await this.eventRepository.getUsersByEventIdNoLimit(id);
        if (!registeredUsers.some((user) => user.id === userId)) {
            throw new CochonError('user_not_registered', 'User is not registered for this event', 400);
        }

        await this.eventRepository.unregisterUserFromEvent(id, userId);
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
            max,
            type,
            photo,
        } = event;

        if (new Date(dateStart) < new Date() || new Date(dateEnd) < new Date()) {
            throw new CochonError('invalid_date', 'The start and end dates must be in the future', 400);
        }

        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);

        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        if (
            neighborhood.neighborhood_users &&
            !neighborhood.neighborhood_users.some((member) => member.userId === createdBy)
        ) {
            throw new CochonError('not_member_of_neighborhood', 'You are not a member of this neighborhood', 403);
        }

        await this.tagsService.getTagById(tagId);

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
        eventEntity.min = 1;
        eventEntity.max = max;
        eventEntity.photo = photoUrl;
        eventEntity.type = type;

        if (addressStart) {
            eventEntity.addressStart = this.parseGeo(addressStart);
        }
        if (addressEnd) {
            eventEntity.addressEnd = this.parseGeo(addressEnd);
        }

        const createdEvent = await this.eventRepository.createEvent(eventEntity);
        if (eventEntity.type === EventType.EVENT) {
            this.eventRepository.registerUserForEvent(createdEvent.id, createdEvent.createdBy);
        }

        const newEvent = await this.eventRepository.getEventById(createdEvent.id);
        if (!newEvent) {
            throw new CochonError('event_creation_error', 'Event creation failed, event not found', 500);
        }
        newEvent.photo = prevLink;
        return EventsAdapter.entityToDomain(newEvent);
    }

    public getEventsByUserId(userId: number): Promise<Event[]> {
        return this.eventRepository.getEventsByUserId(userId).then((events) => {
            return this.replacePhotosByLinks(EventsAdapter.listEntityToDomain(events));
        });
    }

    private async replacePhotoByLink(event: Event): Promise<Event> {
        if (event.photo) {
            event.photo = await this.objectStorageService.getFileLink(event.photo, BucketType.EVENT_IMAGES);
        }
        return event;
    }

    private async replacePhotosByLinks(events: Event[]): Promise<Event[]> {
        return Promise.all(
            events.map((event) => {
                return this.replacePhotoByLink(event);
            })
        );
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
