import { GroupMessage } from './group-message.model';

export enum GroupType {
    PRIVATE_CHAT = 'private_chat',
    PRIVATE_GROUP = 'private_group',
    PUBLIC = 'public',
}

export class Group {
    id!: number;
    name!: string;
    description!: string;
    type!: GroupType;
    isPrivate!: boolean;
    neighborhoodId!: number;
    tagId?: number;
    imageUrl?: string;
    createdAt!: Date;
    memberCount?: number;
    lastMessage?: GroupMessage;
}

export type CreateGroup = Omit<Group, 'id' | 'createdAt' | 'memberCount' | 'lastMessage'>;
export type UpdateGroup = Partial<Omit<Group, 'id' | 'createdAt' | 'neighborhoodId' | 'memberCount' | 'lastMessage'>>;
