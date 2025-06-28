import { Injectable } from '@nestjs/common';
import { CreateGroup, Group, GroupType, UpdateGroup } from '../domain/group.model';
import { CreateGroupMessage, GroupMessage } from '../domain/group-message.model';
import {
    CreateGroupMembership,
    GroupMembership,
    InviteGroupMembership,
    MembershipStatus,
} from '../domain/group-membership.model';
import { GroupRepository } from '../domain/group.abstract.repository';
import { GroupMessageRepository } from '../domain/group-message.abstract.repository';
import { GroupMembershipRepository } from '../domain/group-membership.abstract.repository';
import { NeighborhoodUserRepository } from '../../neighborhoods/domain/neighborhood-user.abstract.repository';
import { UsersService } from '../../users/services/users.service';
import { UserSummaryDto } from '../controllers/dto/messaging.dto';
import { CochonError } from '../../../utils/CochonError';
import { isNotNull, isNull } from '../../../utils/tools';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { NeighborhoodRepository } from '../../neighborhoods/domain/neighborhood.abstract.repository';
import { TagsRepository } from '../../tags/domain/tags.abstract.repository';

@Injectable()
export class MessagingService {
    constructor(
        private readonly groupRepository: GroupRepository,
        private readonly messageRepository: GroupMessageRepository,
        public readonly membershipRepository: GroupMembershipRepository,
        private readonly neighborhoodRepository: NeighborhoodRepository,
        private readonly neighborhoodUserRepository: NeighborhoodUserRepository,
        private readonly usersService: UsersService,
        private readonly objectStorageService: ObjectStorageService,
        private readonly tagRepository: TagsRepository
    ) {}

    async createPrivateChat(userId: number, targetUserId: number, neighborhoodId: number): Promise<Group> {
        // Check si les deux sont dans le quartier
        await this.validateUsersInNeighborhood([userId, targetUserId], neighborhoodId);

        // Check si déjà une conv entre eux
        const existingChat = await this.groupRepository.findPrivateChatBetweenUsers(
            userId,
            targetUserId,
            neighborhoodId
        );

        // Si oui crée pas mais la renvoie
        if (isNotNull(existingChat)) {
            return existingChat;
        }

        const [currentUser, targetUser] = await Promise.all([
            this.usersService.getUserById(userId),
            this.usersService.getUserById(targetUserId),
        ]);

        if (isNull(currentUser) || isNull(targetUser)) {
            throw new CochonError('user_not_found', 'Utilisateur non trouvé', 404);
        }

        // Créer le groupe pour le chat privé
        const groupData: CreateGroup = {
            name: `${currentUser.firstName} & ${targetUser.firstName}`,
            description: `Discussion privée entre ${currentUser.firstName} et ${targetUser.firstName}`,
            type: GroupType.PRIVATE_CHAT,
            isPrivate: true, // Une conversation entre deux utilisateurs est toujours privée
            neighborhoodId,
            tagId: undefined, // Une conversation entre deux personnes n'a pas de tag
        };

        const group = await this.groupRepository.create(groupData);

        // Crée les associations (aucun owner pour les chats privés)
        const memberships: CreateGroupMembership[] = [
            {
                userId,
                groupId: group.id,
                status: MembershipStatus.ACTIVE,
                isOwner: false,
            },
            {
                userId: targetUserId,
                groupId: group.id,
                status: MembershipStatus.ACTIVE,
                isOwner: false,
            },
        ];

        await this.membershipRepository.createMany(memberships);

        // Convertir l'URL de l'image si elle existe
        if (isNotNull(group.imageUrl)) {
            group.imageUrl = await this.replaceGroupImageUrl(group.imageUrl);
        }

        return group;
    }

    async createGroup(
        userId: number,
        groupData: CreateGroup,
        options?: {
            memberIds?: number[];
            groupImage?: Express.Multer.File;
        }
    ): Promise<Group> {
        const neighborhoodExists = await this.neighborhoodRepository.getNeighborhoodById(groupData.neighborhoodId);

        if (isNull(neighborhoodExists)) {
            throw new CochonError('neighborhood_not_found', 'Quartier non trouvé', 404, {
                neighborhoodId: groupData.neighborhoodId,
            });
        }

        if (isNotNull(groupData.tagId)) {
            const tagExists = await this.tagRepository.getTagById(groupData.tagId);
            if (isNull(tagExists)) {
                throw new CochonError('tag_not_found', 'Tag non trouvé', 404, {
                    tagId: groupData.tagId,
                });
            }
        }

        await this.validateUserInNeighborhood(userId, groupData.neighborhoodId);

        let imageUrl: string | undefined = groupData.imageUrl;
        if (options?.groupImage) {
            try {
                imageUrl = await this.objectStorageService.uploadFile(
                    options.groupImage.buffer,
                    options.groupImage.originalname,
                    BucketType.GROUP_IMAGES
                );
            } catch (error) {
                console.error('Error uploading group image:', error);
            }
        }

        const finalGroupData: CreateGroup = {
            ...groupData,
            imageUrl,
        };

        const group = await this.groupRepository.create(finalGroupData);

        const creatorMembership: CreateGroupMembership = {
            userId,
            groupId: group.id,
            status: MembershipStatus.ACTIVE,
            isOwner: true,
        };
        await this.membershipRepository.create(creatorMembership);

        // Ajouter les autres membres si spécifiés (en tant qu'invitations)
        // Uniquement pour les groupes privés - les groupes publics n'ont pas de système d'invitation
        if (options?.memberIds?.length && group.type === GroupType.PRIVATE_GROUP) {
            const additionalMemberships = options.memberIds.map(
                (memberId): CreateGroupMembership => ({
                    userId: memberId,
                    groupId: group.id,
                    status: MembershipStatus.PENDING,
                    isOwner: false,
                })
            );
            await this.membershipRepository.createMany(additionalMemberships);
        }

        if (isNotNull(group.imageUrl)) {
            group.imageUrl = await this.replaceGroupImageUrl(group.imageUrl);
        }

        return group;
    }

    async updateGroup(
        userId: number,
        groupId: number,
        updateData: UpdateGroup,
        options?: {
            groupImage?: Express.Multer.File;
        }
    ): Promise<Group> {
        const group = await this.groupRepository.findById(groupId);

        if (isNull(group)) {
            throw new CochonError('group_not_found', 'Groupe non trouvé', 404, {
                userId,
                groupId,
            });
        }

        const membership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNull(membership) || membership.status !== MembershipStatus.ACTIVE) {
            throw new CochonError('not_member_of_group', "Vous n'êtes pas membre de ce groupe", 403, {
                userId,
                groupId,
            });
        }

        if (!membership.isOwner) {
            throw new CochonError('not_group_owner', 'Seul le propriétaire peut modifier le groupe', 403, {
                userId,
                groupId,
            });
        }

        if (isNotNull(updateData.tagId)) {
            const tagExists = await this.tagRepository.getTagById(updateData.tagId);
            if (isNull(tagExists)) {
                throw new CochonError('tag_not_found', 'Tag non trouvé', 404, {
                    tagId: updateData.tagId,
                });
            }
        }

        let imageUrl: string | undefined = updateData.imageUrl;
        if (options?.groupImage) {
            try {
                // Supprimer l'ancienne image si elle existe
                if (isNotNull(group.imageUrl)) {
                    try {
                        await this.objectStorageService.deleteFile(group.imageUrl, BucketType.GROUP_IMAGES);
                    } catch (error) {
                        console.error('Error deleting old group image:', error);
                    }
                }

                // Télécharger la nouvelle image
                imageUrl = await this.objectStorageService.uploadFile(
                    options.groupImage.buffer,
                    options.groupImage.originalname,
                    BucketType.GROUP_IMAGES
                );
            } catch (error) {
                console.error('Error uploading group image:', error);
            }
        }

        const finalUpdateData: UpdateGroup = {
            ...updateData,
            ...(imageUrl !== undefined && { imageUrl }),
        };

        const updatedGroup = await this.groupRepository.update(groupId, finalUpdateData);

        if (isNotNull(updatedGroup.imageUrl)) {
            updatedGroup.imageUrl = await this.replaceGroupImageUrl(updatedGroup.imageUrl);
        }

        return updatedGroup;
    }

    async sendMessage(userId: number, content: string, groupId: number): Promise<GroupMessage> {
        const membership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNull(membership) || membership.status !== MembershipStatus.ACTIVE) {
            throw new CochonError('not_member_of_group', "Vous n'êtes pas membre de ce groupe", 403, {
                userId,
                groupId,
            });
        }

        const messageData: CreateGroupMessage = {
            content,
            userId,
            groupId,
        };
        const message = await this.messageRepository.create(messageData);
        
        // Convertir l'URL de profil de l'utilisateur si présente
        if (message.user?.profileImageUrl) {
            message.user.profileImageUrl = await this.objectStorageService.getFileLink(
                message.user.profileImageUrl, 
                BucketType.PROFILE_IMAGES
            );
        }
        
        return message;
    }

    async getUserGroups(
        userId: number,
        neighborhoodId: number,
        page: number,
        limit: number
    ): Promise<[Group[], number]> {
        await this.validateUserInNeighborhood(userId, neighborhoodId);

        const [groups, count] = await this.groupRepository.findUserGroupsInNeighborhood(
            userId,
            neighborhoodId,
            page,
            limit
        );

        const lastMessageUserIds = groups
            .map((group) => group.lastMessage?.userId)
            .filter((uid): uid is number => uid !== undefined);

        if (lastMessageUserIds.length > 0) {
            const uniqueUserIds = Array.from(new Set(lastMessageUserIds));
            const users = await Promise.all(uniqueUserIds.map((uid) => this.usersService.getUserById(uid)));
            const userMap = new Map(users.map((user) => [user.id, user]));

            const groupsWithUsers = await Promise.all(
                groups.map(async (group) => {
                    const newGroup = Object.assign({}, group);

                    // Convertir l'URL de l'image du groupe si elle existe
                    if (isNotNull(newGroup.imageUrl)) {
                        newGroup.imageUrl = await this.replaceGroupImageUrl(newGroup.imageUrl);
                    }

                    if (group.lastMessage) {
                        const userInfo = userMap.get(group.lastMessage.userId);
                        const lastMessageCopy = Object.assign({}, group.lastMessage);

                        if (userInfo) {
                            lastMessageCopy.user = {
                                id: userInfo.id,
                                firstName: userInfo.firstName,
                                lastName: userInfo.lastName,
                                profileImageUrl: userInfo.profileImageUrl,
                            };
                        }

                        newGroup.lastMessage = lastMessageCopy;
                    }

                    return newGroup;
                })
            );

            return [groupsWithUsers, count];
        }

        // Convertir les URLs d'images même quand il n'y a pas de lastMessage
        const groupsWithImages = await Promise.all(
            groups.map(async (group) => {
                if (isNotNull(group.imageUrl)) {
                    const groupCopy = Object.assign({}, group);
                    groupCopy.imageUrl = await this.replaceGroupImageUrl(group.imageUrl);
                    return groupCopy;
                }
                return group;
            })
        );

        return [groupsWithImages, count];
    }

    async getGroupMessages(
        userId: number,
        groupId: number,
        page: number,
        limit: number
    ): Promise<[GroupMessage[], number]> {
        const membership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNull(membership) || membership.status !== MembershipStatus.ACTIVE) {
            throw new CochonError('not_member_of_group', "Vous n'êtes pas membre de ce groupe", 403, {
                userId,
                groupId,
            });
        }

        const [messages, count] = await this.messageRepository.findByGroupId(groupId, page, limit);

        const uniqueUserIds = Array.from(new Set(messages.map((message) => message.userId)));
        const users = await Promise.all(uniqueUserIds.map((uid) => this.usersService.getUserById(uid)));
        const userMap = new Map(users.map((user) => [user.id, user]));

        const messagesWithUsers = messages.map((message) => {
            const newMessage = Object.assign({}, message);
            const userInfo = userMap.get(message.userId);

            if (userInfo) {
                newMessage.user = {
                    id: userInfo.id,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    profileImageUrl: userInfo.profileImageUrl,
                };
            }

            return newMessage;
        });

        return [messagesWithUsers, count];
    }

    async joinGroup(userId: number, groupId: number): Promise<GroupMembership> {
        const group = await this.groupRepository.findById(groupId);

        if (isNull(group)) {
            throw new CochonError('group_not_found', 'Groupe non trouvé', 404, {
                userId,
                groupId,
            });
        }

        // Vérifier que l'utilisateur est membre du quartier
        await this.validateUserInNeighborhood(userId, group.neighborhoodId);

        // Vérifier si déjà membre
        const existingMembership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNotNull(existingMembership)) {
            // Si le membership existe et est ACTIVE, l'utilisateur est déjà membre
            if (existingMembership.status === MembershipStatus.ACTIVE) {
                throw new CochonError('already_member_of_group', 'Vous êtes déjà membre de ce groupe', 400, {
                    userId,
                    groupId,
                });
            }

            // Si le membership existe et est PENDING, on peut l'activer (accepter l'invitation)
            const updatedMembership = await this.membershipRepository.updateStatus(
                existingMembership.id,
                MembershipStatus.ACTIVE
            );

            const user = await this.usersService.getUserById(userId);

            return Object.assign({}, updatedMembership, {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImageUrl: user.profileImageUrl,
                },
            });
        }

        // Groupe public -> on peut rejoindre sans invitation
        if (group.type === GroupType.PUBLIC && !group.isPrivate) {
            const membershipData: CreateGroupMembership = {
                userId,
                groupId,
                status: MembershipStatus.ACTIVE,
                isOwner: false,
            };
            const membership = await this.membershipRepository.create(membershipData);

            const user = await this.usersService.getUserById(userId);

            return Object.assign({}, membership, {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImageUrl: user.profileImageUrl,
                },
            });
        }

        // Groupe privée mais pas invité
        throw new CochonError(
            'group_private_no_invitation',
            'Ce groupe est privé. Vous devez être invité pour le rejoindre.',
            403,
            {
                userId,
                groupId,
            }
        );
    }

    async declineGroupInvitation(userId: number, groupId: number): Promise<{ success: boolean }> {
        const group = await this.groupRepository.findById(groupId);

        if (isNull(group)) {
            throw new CochonError('group_not_found', 'Groupe non trouvé', 404, {
                userId,
                groupId,
            });
        }

        await this.validateUserInNeighborhood(userId, group.neighborhoodId);

        const existingMembership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNull(existingMembership)) {
            throw new CochonError('no_invitation_found', 'Aucune invitation trouvée pour ce groupe', 404, {
                userId,
                groupId,
            });
        }

        if (existingMembership.status !== MembershipStatus.PENDING) {
            throw new CochonError('invitation_not_pending', "L'invitation n'est pas en attente", 400, {
                userId,
                groupId,
                currentStatus: existingMembership.status,
            });
        }

        await this.membershipRepository.updateStatus(existingMembership.id, MembershipStatus.DECLINED);

        return { success: true };
    }

    async leaveGroup(userId: number, groupId: number): Promise<{ success: boolean }> {
        const group = await this.groupRepository.findById(groupId);

        if (isNull(group)) {
            throw new CochonError('group_not_found', 'Groupe non trouvé', 404, {
                userId,
                groupId,
            });
        }

        const membership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNull(membership) || membership.status !== MembershipStatus.ACTIVE) {
            throw new CochonError('not_member_of_group', "Vous n'êtes pas membre de ce groupe", 403, {
                userId,
                groupId,
            });
        }

        const activeMembers = await this.membershipRepository.findActiveByGroupId(groupId);

        // Propriétaire qui quitte : on doit transférer la propriété
        if (membership.isOwner && activeMembers.length > 1) {
            const otherMembers = activeMembers.filter((m) => m.userId !== userId);
            // Le plus ancien membre actif devient le nouveau propriétaire
            const newOwner = otherMembers[0];

            await this.membershipRepository.updateOwner(newOwner.id, newOwner.userId, true);

            await this.membershipRepository.delete(membership.id);

            return { success: true };
        }

        // Propriétaire seul : on supprime le groupe
        if (activeMembers.length === 1) {
            await this.groupRepository.delete(groupId);
            return { success: true };
        }

        // Utilisateur qui quitte : on supprime juste le membership
        await this.membershipRepository.delete(membership.id);
        return { success: true };
    }

    async deleteGroup(userId: number, groupId: number): Promise<{ success: boolean }> {
        const group = await this.groupRepository.findById(groupId);

        if (isNull(group)) {
            throw new CochonError('group_not_found', 'Groupe non trouvé', 404, {
                userId,
                groupId,
            });
        }

        // Vérifier que l'utilisateur est membre du groupe
        const membership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNull(membership) || membership.status !== MembershipStatus.ACTIVE) {
            throw new CochonError('not_member_of_group', "Vous n'êtes pas membre de ce groupe", 403, {
                userId,
                groupId,
            });
        }

        // Seul le propriétaire peut supprimer le groupe
        if (!membership.isOwner) {
            throw new CochonError('not_group_owner', 'Seul le propriétaire peut supprimer le groupe', 403, {
                userId,
                groupId,
            });
        }

        // Supprimer le groupe (CASCADE supprimera automatiquement les memberships et messages)
        await this.groupRepository.delete(groupId);

        return { success: true };
    }

    async getGroupMembers(userId: number, groupId: number): Promise<GroupMembership[]> {
        // Vérifier l'accès au groupe
        const membership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNull(membership) || membership.status !== MembershipStatus.ACTIVE) {
            throw new CochonError('not_member_of_group', "Vous n'êtes pas membre de ce groupe", 403, {
                userId,
                groupId,
            });
        }

        const memberships = await this.membershipRepository.findActiveByGroupId(groupId);

        // Recup les user depuis le service pour profiter de la logique métier réalisé (pas envoyer le pwd, le bon lien d'image, ...)
        const uniqueUserIds = Array.from(new Set(memberships.map((m) => m.userId)));
        const users = await Promise.all(uniqueUserIds.map((uid) => this.usersService.getUserById(uid)));
        const userMap = new Map(users.map((user) => [user.id, user]));

        // Remplace par les données sur service
        return memberships.map((m) => {
            const newMembership = Object.assign({}, m);
            const userInfo = userMap.get(m.userId);

            if (userInfo) {
                newMembership.user = {
                    id: userInfo.id,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    profileImageUrl: userInfo.profileImageUrl,
                };
            }

            return newMembership;
        });
    }

    async searchUsersInNeighborhood(
        userId: number,
        neighborhoodId: number,
        search?: string
    ): Promise<UserSummaryDto[]> {
        await this.validateUserInNeighborhood(userId, neighborhoodId);

        const [usersWithRole] = await this.neighborhoodUserRepository.getUsersByNeighborhood(neighborhoodId, 1, 100);

        const uniqueUserIds = Array.from(new Set(usersWithRole.map((userWithRole) => userWithRole.user.id))).filter(
            (id) => id !== userId
        );
        const users = await Promise.all(uniqueUserIds.map((uid) => this.usersService.getUserById(uid)));

        let mappedUsers = users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
        }));

        if (isNotNull(search)) {
            const searchLower = search.toLowerCase();
            mappedUsers = mappedUsers.filter(
                (user) =>
                    user.firstName.toLowerCase().includes(searchLower) ||
                    user.lastName.toLowerCase().includes(searchLower)
            );
        }

        return mappedUsers;
    }

    async getAvailableGroups(userId: number, neighborhoodId: number): Promise<Group[]> {
        await this.validateUserInNeighborhood(userId, neighborhoodId);
        const groups = await this.groupRepository.findAvailableGroupsInNeighborhood(neighborhoodId, userId);

        // Convertir les URLs d'images
        return await Promise.all(
            groups.map(async (group) => {
                if (isNotNull(group.imageUrl)) {
                    const groupCopy = Object.assign({}, group);
                    groupCopy.imageUrl = await this.replaceGroupImageUrl(group.imageUrl);
                    return groupCopy;
                }
                return group;
            })
        );
    }

    private async replaceGroupImageUrl(imageUrl: string): Promise<string> {
        if (isNull(imageUrl)) {
            return '';
        }
        const file = await this.objectStorageService.getFileLink(imageUrl, BucketType.GROUP_IMAGES);
        if (!file) {
            throw new CochonError('file-not-found', 'File not found', 404);
        }
        return file;
    }

    private async validateUserInNeighborhood(userId: number, neighborhoodId: number): Promise<void> {
        const isValid = await this.neighborhoodUserRepository.isUserMemberOfNeighborhood(userId, neighborhoodId);

        if (isNull(isValid)) {
            throw new CochonError('not_member_of_neighborhood', 'Vous devez être membre du quartier', 403, {
                userId,
                neighborhoodId,
            });
        }
    }

    private async validateUsersInNeighborhood(userIds: number[], neighborhoodId: number): Promise<void> {
        const validations = await Promise.all(
            userIds.map((userId) => this.neighborhoodUserRepository.isUserMemberOfNeighborhood(userId, neighborhoodId))
        );

        if (validations.some((isValid) => !isValid)) {
            throw new CochonError(
                'not_all_users_in_neighborhood',
                'Tous les utilisateurs doivent être membres du quartier',
                403,
                {
                    userIds,
                    neighborhoodId,
                }
            );
        }
    }

    async getAmountOfMessage(): Promise<number> {
        return await this.messageRepository.getAmountOfMessage();
    }

    async getGroupInvitations(userId: number): Promise<Group[]> {
        const pendingMemberships = await this.membershipRepository.findByUserId(userId);

        const pendingInvitations = pendingMemberships.filter(
            (membership) => membership.status === MembershipStatus.PENDING
        );

        if (pendingInvitations.length === 0) {
            return [];
        }

        const groupIds = pendingInvitations.map((membership) => membership.groupId);
        const validGroups = await this.groupRepository.findByIdsWithMemberCount(groupIds);

        const lastMessageUserIds = validGroups
            .map((group) => group.lastMessage?.userId)
            .filter((uid): uid is number => uid !== undefined);

        if (lastMessageUserIds.length > 0) {
            const uniqueUserIds = Array.from(new Set(lastMessageUserIds));
            const users = await Promise.all(uniqueUserIds.map((uid) => this.usersService.getUserById(uid)));
            const userMap = new Map(users.map((user) => [user.id, user]));

            return await Promise.all(
                validGroups.map(async (group) => {
                    const newGroup = Object.assign({}, group);

                    if (isNotNull(newGroup.imageUrl)) {
                        newGroup.imageUrl = await this.replaceGroupImageUrl(newGroup.imageUrl);
                    }

                    if (group.lastMessage) {
                        const userInfo = userMap.get(group.lastMessage.userId);
                        const lastMessageCopy = Object.assign({}, group.lastMessage);

                        if (userInfo) {
                            lastMessageCopy.user = {
                                id: userInfo.id,
                                firstName: userInfo.firstName,
                                lastName: userInfo.lastName,
                                profileImageUrl: userInfo.profileImageUrl,
                            };
                        }

                        newGroup.lastMessage = lastMessageCopy;
                    }

                    return newGroup;
                })
            );
        }

        return await Promise.all(
            validGroups.map(async (group) => {
                if (isNotNull(group.imageUrl)) {
                    const groupCopy = Object.assign({}, group);
                    groupCopy.imageUrl = await this.replaceGroupImageUrl(group.imageUrl);
                    return groupCopy;
                }
                return group;
            })
        );
    }

    async inviteToGroup(userId: number, data: InviteGroupMembership): Promise<void> {
        const { groupId, userIds } = data;

        const group = await this.groupRepository.findById(groupId);
        if (isNull(group)) {
            throw new CochonError('group_not_found', 'Groupe non trouvé', 404, { groupId });
        }

        const inviterMembership = await this.membershipRepository.findByUserAndGroup(userId, groupId);
        if (isNull(inviterMembership) || inviterMembership.status !== MembershipStatus.ACTIVE) {
            throw new CochonError('not_member_of_group', "Vous n'êtes pas membre de ce groupe", 403, {
                userId: userId,
                groupId,
            });
        }

        console.log('inviterMembership', inviterMembership);
        if (!inviterMembership.isOwner) {
            throw new CochonError('not_group_owner', 'Seul le propriétaire du groupe peut inviter des membres', 403, {
                userId: userId,
                groupId,
            });
        }

        await this.validateUsersInNeighborhood(userIds, group.neighborhoodId);

        // Check si déjà dans le groupe en active ou pending
        const existingMemberships = await Promise.all(
            data.userIds.map((userId) => this.membershipRepository.findByUserAndGroup(userId, groupId))
        );

        if (existingMemberships.some((membership) => membership !== null)) {
            throw new CochonError(
                'already_member_of_group',
                'Un ou plusieurs utilisateurs sont déjà membres du groupe',
                400,
                {
                    userIds,
                    groupId,
                }
            );
        }

        const memberships: CreateGroupMembership[] = data.userIds.map((userId) => ({
            userId,
            groupId,
            status: MembershipStatus.PENDING, // Statut d'invitation
            isOwner: false,
        }));

        await this.membershipRepository.createMany(memberships);
    }
}
