import { NeighborhoodUserRole, NeighborhoodUserStatus } from '../../../core/entities/neighborhood-user.entity';

export interface NeighborhoodMemberModel {
    id: number;
    neighborhoodId: number;
    userId: number;
    firstName: string;
    lastName: string;
    role: NeighborhoodUserRole;
    status: NeighborhoodUserStatus;
}
