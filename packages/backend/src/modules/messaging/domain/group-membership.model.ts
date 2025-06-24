export enum MembershipStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
}

export class GroupMembership {
    id!: number;
    userId!: number;
    groupId!: number;
    status!: MembershipStatus;
    isOwner!: boolean;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
}

export class InviteGroupMembership {
    groupId!: number;
    userIds!: number[];
}

export type CreateGroupMembership = Omit<GroupMembership, 'id' | 'user'>;
export type UpdateMembershipStatus = Pick<GroupMembership, 'status'>;
