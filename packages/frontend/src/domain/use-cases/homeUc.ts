import { UserModel } from '@/domain/models/user.model.ts';
import { UserFrontRepository } from '@/infrastructure/repositories/UserFrontRepository.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { EventModel, EventModelWithUser } from '@/domain/models/event.model.ts';
import { EventRepository } from '@/infrastructure/repositories/EventRepository.ts';
import { ApiGlobalError } from '@/shared/errors/apiGlobalError.ts';
import { TagModel } from '@/domain/models/tag.model.ts';
import { TagRepository } from '@/infrastructure/repositories/TagRepository.ts';
import { SelectedAddress } from '@/domain/models/SelectedAddress.ts';
import { NeighborhoodMemberManageModel } from '@/domain/models/NeighborhoodUser.model.ts';
import { Roles } from '@/domain/models/Roles.ts';
import { UserStatus } from '@/domain/models/UserStatus.ts';
import { EventManageModel } from '@/domain/models/EventManageModel.ts';
import { InvitationModel } from '@/domain/models/invitation.model.ts';

export class HomeUc {
    constructor(
        private userFrontRepository: UserFrontRepository,
        private neighborhoodRepository: NeighborhoodFrontRepository,
        private eventRepository: EventRepository,
        private tagRepository: TagRepository
    ) {}

    async deleteInvitation(invitationId: number): Promise<void> {
        try {
            await this.neighborhoodRepository.deleteInvitation(invitationId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Une erreur est survenue lors de la suppression de l'invitation");
        }
    }

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

    async sendInviteEmails(neighborhoodId: string, emails: string[], durationInDays: number): Promise<void> {
        try {
            await this.neighborhoodRepository.sendInviteEmails(neighborhoodId, emails, durationInDays);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Une erreur est survenue lors de l'envoi des invitations par email");
        }
    }

    async getInvitationsByNeighborhoodId(neighborhoodId: string | number): Promise<InvitationModel[]> {
        try {
            return await this.neighborhoodRepository.getInvitationsByNeighborhoodId(neighborhoodId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération des invitations');
        }
    }

    async generateInviteLink(neighborhoodId: number, duration: number, maxUses: number): Promise<string> {
        try {
            const response = await this.neighborhoodRepository.generateInviteLink(neighborhoodId, duration, maxUses);
            return response.invitationLink;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Une erreur est survenue lors de la génération du lien d'invitation");
        }
    }

    async getNeighborhoodMembers(neighborhoodId: number): Promise<NeighborhoodMemberManageModel[]> {
        try {
            return await this.neighborhoodRepository.getUsersInNeighborhood(neighborhoodId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération des membres du quartier');
        }
    }

    async getNeighborhoodByPos(longitude: string, lagitude: string): Promise<FrontNeighborhood[]> {
        try {
            return await this.neighborhoodRepository.getNeighborhoodByPos(longitude, lagitude);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération du quartier');
        }
    }

    async getUserLocation(userId: number) {
        try {
            const user = await this.userFrontRepository.getUserById(userId);
            if (!user || !user.latitude || !user.longitude || user.latitude == '0' || user.longitude == '0') {
                throw new Error('User location not found');
            }
            return [user.latitude, user.longitude];
        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération du quartier');
        }
    }

    async deleteEvent(eventId: number, reason: string): Promise<void> {
        try {
            await this.eventRepository.deleteEvent(eventId, reason);
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

    async isUserAdminOfNeighborhood(userId: number, neighborhoodId: number | string): Promise<boolean> {
        try {
            const users = await this.neighborhoodRepository.getUsersInNeighborhood(neighborhoodId);
            const user = users.find((user) => user.userId === userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé dans le quartier');
            }
            return user.neighborhoodRole === 'admin';
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Une erreur est survenue lors de la vérification du statut d'administrateur");
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

    async getNeighborhoodManageEvents(neighborhoodId: number): Promise<EventManageModel[]> {
        try {
            const events = await this.eventRepository.getNeighborhoodEvents(neighborhoodId, 2000, 1);
            return events.map((event) => ({
                id: event.id,
                name: event.name,
                createdAt: event.createdAt,
                dateStart: event.dateStart,
                dateEnd: event.dateEnd,
                registeredUsers: event.registeredUsers,
                max: event.max,
                tag: event.tag,
            }));
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

    async createEvent(
        neighborhoodId: number,
        name: string,
        description: string,
        dateStart: Date,
        dateEnd: Date,
        min: number,
        max: number,
        tagId: number,
        addressStart: SelectedAddress,
        addressEnd: SelectedAddress | null,
        eventImage: File,
        type: 'event' | 'service' = 'event'
    ): Promise<EventModel> {
        try {
            return await this.eventRepository.createEvent(
                neighborhoodId,
                name,
                description,
                dateStart,
                dateEnd,
                min,
                max,
                tagId,
                addressStart,
                addressEnd,
                eventImage,
                type
            );
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Une erreur est survenue lors de la création de l'événement");
        }
    }

    async getTags(): Promise<TagModel[]> {
        try {
            return await this.tagRepository.getTags();
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
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

    async joinNeighborhood(neighborhoodId: number): Promise<void> {
        try {
            await this.neighborhoodRepository.joinNeighborhood(neighborhoodId);
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }

    async removeUserFromNeighborhood(neighborhoodId: number, userId: number): Promise<void> {
        try {
            await this.neighborhoodRepository.removeUserFromNeighborhood(neighborhoodId, userId);
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }

    async updateNeighborhoodMemberRole(neighborhoodId: number, userId: number, role: Roles): Promise<void> {
        try {
            await this.neighborhoodRepository.updateNeighborhoodMemberRole(neighborhoodId, userId, role);
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }

    async updateNeighborhoodMemberStatus(neighborhoodId: number, userId: number, status: UserStatus): Promise<void> {
        try {
            await this.neighborhoodRepository.updateNeighborhoodMemberStatus(neighborhoodId, userId, status);
        } catch (error) {
            throw new Error((error as ApiGlobalError).response.data.message);
        }
    }

    async getNeighborhoodById(neighborhoodId: number): Promise<FrontNeighborhood> {
        try {
            return await this.neighborhoodRepository.getNeighborhoodById(neighborhoodId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération du quartier');
        }
    }

    async updateNeighborhoodManage(
        name: string,
        description: string,
        neighborhoodId: number
    ): Promise<FrontNeighborhood> {
        try {
            return await this.neighborhoodRepository.updateNeighborhoodManage(name, description, neighborhoodId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la mise à jour du quartier');
        }
    }
}
