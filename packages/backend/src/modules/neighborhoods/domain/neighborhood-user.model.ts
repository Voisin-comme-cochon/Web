import { NeighborhoodUserRole, NeighborhoodUserStatus } from '../../../core/entities/neighborhood-user.entity';
import { UserEntity } from '../../../core/entities/user.entity';
import { NeighbotorhoodUserRole } from '../../users/domain/user.model';

export interface NeighborhoodUser {
    id: number;
    userId: number;
    role: NeighborhoodUserRole;
    status: NeighborhoodUserStatus;
    neighborhoodId: number;
}

export interface UserWithRole {
    user: UserEntity;
    role: NeighbotorhoodUserRole;
}
