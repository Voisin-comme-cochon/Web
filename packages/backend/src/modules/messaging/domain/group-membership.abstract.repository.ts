import { GroupMembership, MembershipStatus } from './group-membership.model';

export abstract class GroupMembershipRepository {
    abstract findById(id: number): Promise<GroupMembership | null>;

    abstract findByUserAndGroup(userId: number, groupId: number): Promise<GroupMembership | null>;

    abstract findByGroupId(groupId: number): Promise<GroupMembership[]>;

    abstract findByUserId(userId: number): Promise<GroupMembership[]>;

    abstract findActiveByGroupId(groupId: number): Promise<GroupMembership[]>;

    abstract create(membership: Omit<GroupMembership, 'id' | 'user'>): Promise<GroupMembership>;

    abstract createMany(memberships: Omit<GroupMembership, 'id' | 'user'>[]): Promise<GroupMembership[]>;

    abstract updateStatus(id: number, status: MembershipStatus): Promise<GroupMembership>;

    abstract delete(id: number): Promise<void>;

    abstract countActiveByGroupId(groupId: number): Promise<number>;
}
