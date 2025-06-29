export enum GroupType {
    PRIVATE_CHAT = 'private_chat',
    PRIVATE_GROUP = 'private_group',
    PUBLIC = 'public',
}

export enum MembershipStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    DECLINED = 'declined',
}

export interface UserSummaryModel {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    online?: boolean;
}

export interface GroupMessageModel {
    id: number;
    content: string;
    createdAt: string;
    userId: number;
    groupId: number;
    user: UserSummaryModel;
}

export interface GroupMembershipModel {
    id: number;
    status: MembershipStatus;
    joinedAt: string;
    userId: number;
    groupId: number;
    isOwner: boolean;
    user: UserSummaryModel;
}

export interface GroupModel {
    id: number;
    name: string;
    description?: string;
    type: GroupType;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
    neighborhoodId: number;
    tagId?: number;
    memberCount: number;
    lastMessage?: GroupMessageModel;
    members?: GroupMembershipModel[];
    imageUrl?: string;
}

export interface CreateGroupDto {
    name: string;
    description: string;
    type: GroupType;
    isPrivate: boolean;
    neighborhoodId: number;
    tagId?: number;
    memberIds?: number[];
    groupImage?: File;
}

export interface CreatePrivateChatDto {
    targetUserId: number;
    neighborhoodId: number;
}

export interface JoinGroupDto {
    groupId: number;
}

export interface SendMessageDto {
    content: string;
    groupId: number;
}

export interface SearchUsersDto {
    neighborhoodId: number;
    search?: string;
}

export interface GetGroupsDto {
    neighborhoodId: number;
    page?: number;
    limit?: number;
}

export interface GetMessagesDto {
    groupId: number;
    page?: number;
    limit?: number;
}

export interface GetAvailableGroupsDto {
    neighborhoodId: number;
}

export interface GetGroupMembersDto {
    groupId: number;
}

export interface UpdateGroupDto {
    name?: string;
    description?: string;
    type?: GroupType;
    isPrivate?: boolean;
    tagId?: number;
    groupImage?: File;
}
