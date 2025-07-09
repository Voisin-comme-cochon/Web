import ApiService from '../api/ApiService';
import { ApiError } from '../../shared/errors/ApiError';
import { PaginatedResultModel } from '../../domain/models/paginated-result.model';
import {
    GroupModel,
    GroupMessageModel,
    GroupMembershipModel,
    UserSummaryModel,
    CreateGroupDto,
    CreatePrivateChatDto,
    JoinGroupDto,
    SendMessageDto,
    SearchUsersDto,
    GetGroupsDto,
    GetMessagesDto,
    GetAvailableGroupsDto,
    GetGroupMembersDto,
    UpdateGroupDto,
} from '../../domain/models/messaging.model';

export class MessagingRepository {
    private readonly basePath = '/messaging';

    // ===== GESTION DES GROUPES =====

    /**
     * Créer un nouveau groupe
     */
    async createGroup(dto: CreateGroupDto): Promise<GroupModel> {
        try {
            // Si une image est fournie, utiliser FormData pour multipart/form-data
            if (dto.groupImage) {
                const formData = new FormData();

                // Ajouter les champs du DTO
                formData.append('name', dto.name);
                formData.append('description', dto.description);
                formData.append('type', dto.type);
                formData.append('isPrivate', dto.isPrivate.toString());
                formData.append('neighborhoodId', dto.neighborhoodId.toString());

                if (dto.tagId) {
                    formData.append('tagId', dto.tagId.toString());
                }

                if (dto.memberIds && dto.memberIds.length > 0) {
                    dto.memberIds.forEach((id) => formData.append('memberIds', id.toString()));
                }

                // Ajouter le fichier image
                formData.append('groupImage', dto.groupImage);

                const response = await ApiService.post(`${this.basePath}/groups`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                // Pas d'image, utiliser JSON classique
                const response = await ApiService.post(`${this.basePath}/groups`, dto);
                return response.data;
            }
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, 'Données invalides pour la création du groupe');
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas membre de ce quartier");
            }
            throw new ApiError(500, 'Erreur lors de la création du groupe');
        }
    }

    /**
     * Modifier un groupe existant
     */
    async updateGroup(groupId: number, dto: UpdateGroupDto): Promise<GroupModel> {
        try {
            // Si une image est fournie, utiliser FormData pour multipart/form-data
            if (dto.groupImage) {
                const formData = new FormData();

                // Ajouter les champs du DTO seulement s'ils sont définis
                if (dto.name !== undefined) formData.append('name', dto.name);
                if (dto.description !== undefined) formData.append('description', dto.description);
                if (dto.type !== undefined) formData.append('type', dto.type);
                if (dto.isPrivate !== undefined) formData.append('isPrivate', dto.isPrivate.toString());
                if (dto.tagId !== undefined) formData.append('tagId', dto.tagId.toString());

                // Ajouter le fichier image
                formData.append('groupImage', dto.groupImage);

                const response = await ApiService.patch(`${this.basePath}/groups/${groupId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                // Pas d'image, utiliser JSON classique
                const response = await ApiService.patch(`${this.basePath}/groups/${groupId}`, dto);
                return response.data;
            }
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, 'Données invalides pour la modification du groupe');
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, 'Seul le propriétaire peut modifier le groupe');
            }
            if (error.response?.status === 404) {
                throw new ApiError(404, 'Groupe non trouvé');
            }
            throw new ApiError(500, 'Erreur lors de la modification du groupe');
        }
    }

    /**
     * Créer ou récupérer un chat privé
     */
    async createPrivateChat(dto: CreatePrivateChatDto): Promise<GroupModel> {
        try {
            const response = await ApiService.post(`${this.basePath}/chats/private`, dto);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, 'Données invalides pour la création du chat privé');
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas membre de ce quartier");
            }
            if (error.response?.status === 404) {
                throw new ApiError(404, 'Utilisateur non trouvé');
            }
            throw new ApiError(500, 'Erreur lors de la création du chat privé');
        }
    }

    /**
     * Récupérer les groupes de l'utilisateur
     */
    async getGroups(dto: GetGroupsDto): Promise<PaginatedResultModel<GroupModel>> {
        try {
            const params = new URLSearchParams();
            params.append('neighborhoodId', dto.neighborhoodId.toString());
            if (dto.page) params.append('page', dto.page.toString());
            if (dto.limit) params.append('limit', dto.limit.toString());

            const response = await ApiService.get(`${this.basePath}/groups?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas membre de ce quartier");
            }
            throw new ApiError(500, 'Erreur lors de la récupération des groupes');
        }
    }

    /**
     * Rejoindre un groupe public
     */
    async joinGroup(dto: JoinGroupDto): Promise<GroupMembershipModel> {
        try {
            const response = await ApiService.post(`${this.basePath}/groups/join`, dto);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, 'Vous êtes déjà membre de ce groupe');
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, 'Impossible de rejoindre ce groupe privé');
            }
            if (error.response?.status === 404) {
                throw new ApiError(404, 'Groupe non trouvé');
            }
            throw new ApiError(500, "Erreur lors de l'adhésion au groupe");
        }
    }

    /**
     * Décliner une invitation de groupe
     */
    async declineGroupInvitation(dto: JoinGroupDto): Promise<{ success: boolean }> {
        try {
            const response = await ApiService.post(`${this.basePath}/groups/decline`, dto);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, "L'invitation n'est pas en attente");
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas membre de ce quartier");
            }
            if (error.response?.status === 404) {
                throw new ApiError(404, 'Groupe non trouvé ou aucune invitation trouvée');
            }
            throw new ApiError(500, "Erreur lors du déclin de l'invitation");
        }
    }

    /**
     * Quitter un groupe
     */
    async leaveGroup(dto: JoinGroupDto): Promise<{ success: boolean }> {
        try {
            const response = await ApiService.post(`${this.basePath}/groups/leave`, dto);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, "Vous n'êtes pas membre de ce groupe");
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, "Le propriétaire ne peut pas quitter le groupe avec d'autres membres");
            }
            if (error.response?.status === 404) {
                throw new ApiError(404, 'Groupe non trouvé');
            }
            throw new ApiError(500, 'Erreur lors de la sortie du groupe');
        }
    }

    /**
     * Récupérer les membres d'un groupe
     */
    async getGroupMembers(dto: GetGroupMembersDto): Promise<GroupMembershipModel[]> {
        try {
            const response = await ApiService.get(`${this.basePath}/groups/${dto.groupId}/members`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new ApiError(403, 'Accès refusé à ce groupe');
            }
            throw new ApiError(500, 'Erreur lors de la récupération des membres');
        }
    }

    /**
     * Récupérer les groupes publics disponibles
     */
    async getAvailableGroups(dto: GetAvailableGroupsDto): Promise<GroupModel[]> {
        try {
            const params = new URLSearchParams();
            params.append('neighborhoodId', dto.neighborhoodId.toString());

            const response = await ApiService.get(`${this.basePath}/groups/available-groups?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas membre de ce quartier");
            }
            throw new ApiError(500, 'Erreur lors de la récupération des groupes disponibles');
        }
    }

    /**
     * Récupérer les invitations de groupes de l'utilisateur
     */
    async getGroupInvitations(): Promise<GroupModel[]> {
        try {
            const response = await ApiService.get(`${this.basePath}/groups/invite`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(500, 'Erreur lors de la récupération des invitations de groupes');
        }
    }

    // ===== MESSAGERIE =====

    /**
     * Envoyer un message
     */
    async sendMessage(dto: SendMessageDto): Promise<GroupMessageModel> {
        try {
            const response = await ApiService.post(`${this.basePath}/messages`, dto);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, "Données invalides pour l'envoi du message");
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas membre de ce groupe");
            }
            throw new ApiError(500, "Erreur lors de l'envoi du message");
        }
    }

    /**
     * Récupérer l'historique des messages
     */
    async getMessages(dto: GetMessagesDto): Promise<PaginatedResultModel<GroupMessageModel>> {
        try {
            const params = new URLSearchParams();
            params.append('groupId', dto.groupId.toString());
            if (dto.page) params.append('page', dto.page.toString());
            if (dto.limit) params.append('limit', dto.limit.toString());

            const response = await ApiService.get(`${this.basePath}/messages?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new ApiError(403, 'Accès refusé à ce groupe');
            }
            throw new ApiError(500, 'Erreur lors de la récupération des messages');
        }
    }

    /**
     * Inviter des utilisateurs dans un groupe privé
     */
    async inviteToGroup(groupId: number, userIds: number[]): Promise<{ success: boolean }> {
        try {
            const payload = {
                groupId,
                userIds,
            };
            const response = await ApiService.post(`${this.basePath}/groups/invite`, payload);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new ApiError(400, 'Requête invalide pour inviter des utilisateurs');
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas autorisé à inviter des utilisateurs dans ce groupe");
            }
            throw new ApiError(500, "Erreur lors de l'envoi des invitations");
        }
    }

    /**
     * Révoquer une invitation (supprimer une membership en attente ou refusée)
     */
    async removeMember(membershipId: number): Promise<{ success: boolean }> {
        try {
            const response = await ApiService.delete(`${this.basePath}/groups/members/${membershipId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) throw new ApiError(404, 'Membre introuvable');
            if (error.response?.status === 403) throw new ApiError(403, "Vous n'êtes pas autorisé");
            throw new ApiError(500, 'Erreur lors de la suppression du membre');
        }
    }

    async revokeInvitation(membershipId: number): Promise<{ success: boolean }> {
        try {
            const response = await ApiService.delete(`${this.basePath}/groups/invitations/${membershipId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new ApiError(404, 'Invitation introuvable');
            }
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas autorisé à révoquer cette invitation");
            }
            throw new ApiError(500, "Erreur lors de la révocation de l'invitation");
        }
    }

    // ===== RECHERCHE D'UTILISATEURS =====

    /**
     * Rechercher des utilisateurs dans le quartier
     */
    async searchUsers(dto: SearchUsersDto): Promise<UserSummaryModel[]> {
        try {
            const params = new URLSearchParams();
            params.append('neighborhoodId', dto.neighborhoodId.toString());
            if (dto.search) params.append('search', dto.search);

            const response = await ApiService.get(`${this.basePath}/users/search?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new ApiError(403, "Vous n'êtes pas membre de ce quartier");
            }
            throw new ApiError(500, "Erreur lors de la recherche d'utilisateurs");
        }
    }
}
