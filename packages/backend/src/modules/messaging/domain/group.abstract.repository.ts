import { Group } from './group.model';

export abstract class GroupRepository {
    abstract findById(id: number): Promise<Group | null>;

    abstract findByNeighborhoodId(neighborhoodId: number): Promise<Group[]>;

    abstract findUserGroupsInNeighborhood(
        userId: number,
        neighborhoodId: number,
        page: number,
        limit: number
    ): Promise<[Group[], number]>;

    abstract findPrivateChatBetweenUsers(
        user1Id: number,
        user2Id: number,
        neighborhoodId: number
    ): Promise<Group | null>;

    abstract create(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group>;

    abstract update(id: number, group: Partial<Group>): Promise<Group>;

    abstract delete(id: number): Promise<void>;

    abstract findAvailableGroupsInNeighborhood(neighborhoodId: number, userId: number): Promise<Group[]>;
}
