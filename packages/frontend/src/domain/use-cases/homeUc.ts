import { UserModel } from '@/domain/models/user.model.ts';
import { UserFrontRepository } from '@/infrastructure/repositories/UserFrontRepository.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { EventModel, EventModelWithUser } from '@/domain/models/event.model.ts';
import { EventRepository } from '@/infrastructure/repositories/EventRepository.ts';
import { ApiGlobalError } from '@/shared/errors/apiGlobalError.ts';

export class HomeUc {
    constructor(
        private userFrontRepository: UserFrontRepository,
        private neighborhoodRepository: NeighborhoodFrontRepository,
        private eventRepository: EventRepository
    ) {}

    async isUserRegistered(eventId: number, userId: number): Promise<boolean> {
        try {
            const event = await this.eventRepository.getEventById(eventId);
            return event.registeredUsers.some((user) => user.id === userId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Une erreur est survenue lors de la vérification de l'inscription");
        }
    }

    async deleteEvent(eventId: number): Promise<void> {
        try {
            await this.eventRepository.deleteEvent(eventId);
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }

    async getUserById(id: string | number): Promise<UserModel> {
        try {
            return await this.userFrontRepository.getUserById(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la création du quartier');
        }
    }

    async getMyNeighborhoods(id: string | number): Promise<FrontNeighborhood[]> {
        try {
            return await this.neighborhoodRepository.getMyNeighborhoods(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération des quartiers');
        }
    }

    async getNeighborhoodEvents(neighborhoodId: number, limit: number, page: number): Promise<EventModel[]> {
        try {
            return await this.eventRepository.getNeighborhoodEvents(neighborhoodId, limit, page);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération des événements du quartier');
        }
    }

    async getEventById(eventId: number): Promise<EventModelWithUser> {
        try {
            return await this.eventRepository.getEventById(eventId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Une erreur est survenue lors de la récupération de l'événement");
        }
    }

    async registerToEvent(eventId: number): Promise<void> {
        try {
            await this.eventRepository.registerToEvent(eventId);
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }

    async unRegisterFromEvent(eventId: number): Promise<void> {
        try {
            await this.eventRepository.unregisterFromEvent(eventId);
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }

    async getEventsByUserId(): Promise<EventModel[]> {
        try {
            return await this.eventRepository.getEventsByUserId();
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }
}
