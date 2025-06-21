export class GroupMessage {
    id!: number;
    content!: string;
    userId!: number;
    groupId!: number;
    createdAt!: Date;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
}

export type CreateGroupMessage = Omit<GroupMessage, 'id' | 'createdAt' | 'user'>;
