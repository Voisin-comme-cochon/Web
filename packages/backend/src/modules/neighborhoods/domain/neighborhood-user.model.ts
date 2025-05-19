import { NeighborhoodUserRole, NeighborhoodUserStatus } from '../../../core/entities/neighborhood-user.entity';

export interface NeighborhoodUser {
    id: number;
    userId: number;
    role: NeighborhoodUserRole;
    status: NeighborhoodUserStatus;
    neighborhoodId: number;
}
