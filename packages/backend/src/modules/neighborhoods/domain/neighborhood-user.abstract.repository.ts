import { UserWithRole } from '../repository/neighborhood-user.repository.implementation';
import {
    NeighborhoodUserEntity,
    NeighborhoodUserRole,
    NeighborhoodUserStatus,
} from '../../../core/entities/neighborhood-user.entity';
import { Neighborhood } from './neighborhood.model';

export abstract class NeighborhoodUserRepository {
    abstract getUsersByNeighborhood(
        neighborhoodId: number,
        page?: number,
        limit?: number
    ): Promise<[UserWithRole[], number]>;

    abstract getUserInNeighborhood(neighborhoodId: number, userId: number): Promise<UserWithRole | null>;

    abstract getUsersByRoleInNeighborhoodId(
        neighborhoodId: number,
        role: NeighborhoodUserRole
    ): Promise<UserWithRole[] | null>;

    abstract getUsersInNeighborhoodByStatus(
        neighborhoodId: number,
        status: NeighborhoodUserStatus
    ): Promise<[UserWithRole[], number]>;

    abstract getNeighborhoodsByUserId(id: number): Promise<Neighborhood[]>;

    abstract addUserToNeighborhood(neighborhoodUser: NeighborhoodUserEntity): Promise<NeighborhoodUserEntity>;

    abstract removeUserFromNeighborhood(userId: number, neighborhoodId: number): Promise<void>;
}
