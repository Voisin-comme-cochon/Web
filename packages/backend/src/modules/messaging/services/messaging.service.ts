import { Injectable } from '@nestjs/common';
import { CreateGroup, Group, GroupType } from '../domain/group.model';
import { CreateGroupMessage, GroupMessage } from '../domain/group-message.model';
import { CreateGroupMembership, GroupMembership, MembershipStatus } from '../domain/group-membership.model';
import { GroupRepository } from '../domain/group.abstract.repository';
import { GroupMessageRepository } from '../domain/group-message.abstract.repository';
import { GroupMembershipRepository } from '../domain/group-membership.abstract.repository';
import { NeighborhoodUserRepository } from '../../neighborhoods/domain/neighborhood-user.abstract.repository';
import { UsersService } from '../../users/services/users.service';
import { UserSummaryDto } from '../controllers/dto/messaging.dto';
import { CochonError } from '../../../utils/CochonError';
import { isNotNull, isNull } from '../../../utils/tools';

export interface CreateGroupCommand {
    name: string;
    description: string;
    type: GroupType;
    isPrivate: boolean;
    neighborhoodId: number;
    tagId?: number;
    memberIds?: number[];
}

export interface CreatePrivateChatCommand {
    targetUserId: number;
    neighborhoodId: number;
}

export interface SendMessageCommand {
    content: string;
    groupId: number;
}

@Injectable()
export class MessagingService {
    constructor(
        private readonly groupRepository: GroupRepository,
        private readonly messageRepository: GroupMessageRepository,
        public readonly membershipRepository: GroupMembershipRepository,
        private readonly neighborhoodUserRepository: NeighborhoodUserRepository,
        private readonly usersService: UsersService
    ) {}

    async createPrivateChat(userId: number, command: CreatePrivateChatCommand): Promise<Group> {
        const { targetUserId, neighborhoodId } = command;

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

        // Crée les associations
        const memberships: CreateGroupMembership[] = [
            {
                userId,
                groupId: group.id,
                status: MembershipStatus.ACTIVE,
            },
            {
                userId: targetUserId,
                groupId: group.id,
                status: MembershipStatus.ACTIVE,
            },
        ];

        await this.membershipRepository.createMany(memberships);

        return group;
    }

    async createGroup(userId: number, command: CreateGroupCommand): Promise<Group> {
        const { neighborhoodId } = command;

        // Vérifier que l'utilisateur est membre du quartier
        await this.validateUserInNeighborhood(userId, neighborhoodId);

        // Créer le groupe
        const groupData: CreateGroup = {
            name: command.name,
            description: command.description,
            type: command.type,
            isPrivate: command.isPrivate,
            neighborhoodId: command.neighborhoodId,
            tagId: command.tagId,
        };

        const group = await this.groupRepository.create(groupData);

        // Ajouter le créateur comme membre
        const creatorMembership: CreateGroupMembership = {
            userId,
            groupId: group.id,
            status: MembershipStatus.ACTIVE,
        };
        await this.membershipRepository.create(creatorMembership);

        // Ajouter les autres membres si spécifiés
        if (command.memberIds?.length) {
            const additionalMemberships = command.memberIds.map(
                (memberId): CreateGroupMembership => ({
                    userId: memberId,
                    groupId: group.id,
                    status: MembershipStatus.ACTIVE,
                })
            );
            await this.membershipRepository.createMany(additionalMemberships);
        }

        return group;
    }

    async sendMessage(userId: number, command: SendMessageCommand): Promise<GroupMessage> {
        const { groupId, content } = command;

        // Check si bien membre du groupe
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
        return await this.messageRepository.create(messageData);
    }

    async getUserGroups(
        userId: number,
        neighborhoodId: number,
        page: number,
        limit: number
    ): Promise<[Group[], number]> {
        // Check si bien membre du quartier
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

            const groupsWithUsers = groups.map((group) => {
                const newGroup = Object.assign({}, group);

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
            });

            return [groupsWithUsers, count];
        }

        return [groups, count];
    }

    async getGroupMessages(
        userId: number,
        groupId: number,
        page: number,
        limit: number
    ): Promise<[GroupMessage[], number]> {
        // Check si bien membre du groupe
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

        if (!(group.type === GroupType.PUBLIC && !group.isPrivate)) {
            throw new CochonError(
                'group_not_public',
                'Seuls les groupes publics peuvent être rejoints librement',
                403,
                {
                    userId,
                    groupId,
                }
            );
        }

        // Vérifier que l'utilisateur est membre du quartier
        await this.validateUserInNeighborhood(userId, group.neighborhoodId);

        // Vérifier si déjà membre
        const existingMembership = await this.membershipRepository.findByUserAndGroup(userId, groupId);

        if (isNotNull(existingMembership)) {
            throw new CochonError('already_member_of_group', 'Vous êtes déjà membre de ce groupe', 400, {
                userId,
                groupId,
            });
        }

        // Créer le membership
        const membershipData: CreateGroupMembership = {
            userId,
            groupId,
            status: MembershipStatus.ACTIVE,
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

        let users = usersWithRole.map((userWithRole) => ({
            id: userWithRole.user.id,
            firstName: userWithRole.user.firstName,
            lastName: userWithRole.user.lastName,
            profileImageUrl: userWithRole.user.profileImageUrl,
        }));

        if (isNotNull(search)) {
            const searchLower = search.toLowerCase();
            users = users.filter(
                (user) =>
                    user.firstName.toLowerCase().includes(searchLower) ||
                    user.lastName.toLowerCase().includes(searchLower)
            );
        }

        return users;
    }

    async getAvailableGroups(userId: number, neighborhoodId: number): Promise<Group[]> {
        await this.validateUserInNeighborhood(userId, neighborhoodId);
        return await this.groupRepository.findAvailableGroupsInNeighborhood(neighborhoodId, userId);
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
}
