export enum MembershipStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    REJECTED = 'rejected',
}

export class GroupMembership {
    id!: number;
    userId!: number;
    groupId!: number;
    status!: MembershipStatus;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
}

export type CreateGroupMembership = Omit<GroupMembership, 'id' | 'user'>;
export type UpdateMembershipStatus = Pick<GroupMembership, 'status'>;
