import { MessagingRepository } from '@/infrastructure/repositories/MessagingRepository.ts';
import { PaginatedResultModel } from '../models/paginated-result.model';
import {
    GroupModel,
    GroupMessageModel,
    GroupMembershipModel,
    UserSummaryModel,
    CreateGroupDto,
} from '../models/messaging.model';
import { formatMessageTime } from '@/utils/dateUtils';
import { userCache } from '@/utils/userCache';

export class MessagingUc {
    constructor(private messagingRepository: MessagingRepository) {}

    // ===== GESTION DES GROUPES =====

    async createGroup(dto: CreateGroupDto): Promise<GroupModel> {
        try {
            if (!dto.name.trim()) {
                throw new Error('Le nom du groupe est requis');
            }
            if (!dto.description.trim()) {
                throw new Error('La description du groupe est requise');
            }
            if (!dto.neighborhoodId) {
                throw new Error("L'ID du quartier est requis");
            }

            return await this.messagingRepository.createGroup(dto);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erreur lors de la création du groupe');
        }
    }

    async createPrivateChat(targetUserId: number, neighborhoodId: number): Promise<GroupModel> {
        try {
            if (!targetUserId) {
                throw new Error("L'ID de l'utilisateur cible est requis");
            }
            if (!neighborhoodId) {
                throw new Error("L'ID du quartier est requis");
            }

            return await this.messagingRepository.createPrivateChat({
                targetUserId,
                neighborhoodId,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erreur lors de la création du chat privé');
        }
    }

    async getGroups(
        neighborhoodId: number,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResultModel<GroupModel>> {
        try {
            if (!neighborhoodId) {
                throw new Error("L'ID du quartier est requis");
            }

            return await this.messagingRepository.getGroups({
                neighborhoodId,
                page,
                limit,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erreur lors de la récupération des groupes');
        }
    }

    async joinGroup(groupId: number): Promise<GroupMembershipModel> {
        try {
            if (!groupId) {
                throw new Error("L'ID du groupe est requis");
            }

            return await this.messagingRepository.joinGroup({ groupId });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Erreur lors de l'adhésion au groupe");
        }
    }

    async declineGroupInvitation(groupId: number): Promise<{ success: boolean }> {
        try {
            if (!groupId) {
                throw new Error("L'ID du groupe est requis");
            }

            return await this.messagingRepository.declineGroupInvitation({ groupId });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Erreur lors du déclin de l'invitation");
        }
    }

    async leaveGroup(groupId: number): Promise<{ success: boolean }> {
        try {
            if (!groupId) {
                throw new Error("L'ID du groupe est requis");
            }

            return await this.messagingRepository.leaveGroup({ groupId });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Erreur lors de la sortie du groupe");
        }
    }

    async getGroupMembers(groupId: number): Promise<GroupMembershipModel[]> {
        try {
            if (!groupId) {
                throw new Error("L'ID du groupe est requis");
            }

            const members = await this.messagingRepository.getGroupMembers({ groupId });
            
            // Pré-charger les utilisateurs dans le cache
            userCache.preloadGroupMembers(members);
            
            return members;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erreur lors de la récupération des membres');
        }
    }

    async getAvailableGroups(neighborhoodId: number): Promise<GroupModel[]> {
        try {
            if (!neighborhoodId) {
                throw new Error("L'ID du quartier est requis");
            }

            return await this.messagingRepository.getAvailableGroups({ neighborhoodId });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erreur lors de la récupération des groupes disponibles');
        }
    }

    async getGroupInvitations(): Promise<GroupModel[]> {
        try {
            return await this.messagingRepository.getGroupInvitations();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erreur lors de la récupération des invitations de groupes');
        }
    }

    // ===== INVITATIONS =====

    async removeMember(membershipId: number): Promise<{ success: boolean }> {
        return await this.messagingRepository.removeMember(membershipId);
    }

    async revokeInvitation(membershipId: number): Promise<{ success: boolean }> {
        return await this.messagingRepository.revokeInvitation(membershipId);
    }

    async inviteToGroup(groupId: number, userIds: number[]): Promise<{ success: boolean }> {
        try {
            if (!groupId || userIds.length === 0) {
                throw new Error('GroupId et userIds requis');
            }
            return await this.messagingRepository.inviteToGroup(groupId, userIds);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Erreur lors de l'envoi des invitations");
        }
    }

    // ===== MESSAGERIE =====

    async sendMessage(content: string, groupId: number): Promise<GroupMessageModel> {
        try {
            if (!content.trim()) {
                throw new Error('Le contenu du message ne peut pas être vide');
            }
            if (!groupId) {
                throw new Error("L'ID du groupe est requis");
            }

            return await this.messagingRepository.sendMessage({
                content: content.trim(),
                groupId,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Erreur lors de l'envoi du message");
        }
    }

    async getMessages(
        groupId: number,
        page: number = 1,
        limit: number = 50
    ): Promise<PaginatedResultModel<GroupMessageModel>> {
        try {
            if (!groupId) {
                throw new Error("L'ID du groupe est requis");
            }

            return await this.messagingRepository.getMessages({
                groupId,
                page,
                limit,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erreur lors de la récupération des messages');
        }
    }

    // ===== RECHERCHE D'UTILISATEURS =====

    async searchUsers(neighborhoodId: number, search?: string): Promise<UserSummaryModel[]> {
        try {
            if (!neighborhoodId) {
                throw new Error("L'ID du quartier est requis");
            }

            return await this.messagingRepository.searchUsers({
                neighborhoodId,
                search: search?.trim(),
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Erreur lors de la recherche d'utilisateurs");
        }
    }

    // ===== MÉTHODES UTILITAIRES =====

    getUserDisplayName(user: UserSummaryModel): string {
        return `${user.firstName} ${user.lastName}`;
    }

    isPrivateChat(group: GroupModel): boolean {
        return group.type === 'private_chat';
    }

    getGroupDisplayName(group: GroupModel, currentUserId?: number): string {
        if (this.isPrivateChat(group) && group.members && currentUserId) {
            // Pour un chat privé, afficher le nom de l'autre personne
            const otherMember = group.members.find((member) => member.userId !== currentUserId);
            if (otherMember) {
                return this.getUserDisplayName(otherMember.user);
            }
        }
        return group.name;
    }

    formatMessageTime(dateString: string): string {
        return formatMessageTime(dateString);
    }
}
