import { isNull } from '../../../utils/tools';
import { CochonError } from '../../../utils/CochonError';
import { NeighborhoodUserRepository } from '../domain/neighborhood-user.abstract.repository';
import { UserAdapter } from '../../users/adapters/user.adapter';
import { User } from '../../users/domain/user.model';
import { NeighborhoodService } from './neighborhood.service';

export interface UserDomainWithRole {
    user: User;
    role: string;
}

export class NeighborhoodUserService {
    constructor(
        private readonly neighborhoodUserRepository: NeighborhoodUserRepository,
        private readonly neighborhoodService: NeighborhoodService
    ) {}

    async getUsersByNeighborhood(
        neighborhoodId: number,
        page = 1,
        limit = 10
    ): Promise<[UserDomainWithRole[], number]> {
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404, {
                neighborhoodId,
            });
        }

        const [usersWithRoles, count] = await this.neighborhoodUserRepository.getUsersByNeighborhood(
            neighborhoodId,
            page,
            limit
        );

        const userDomainsWithRoles = usersWithRoles.map((userWithRole) => ({
            user: UserAdapter.entityToDomain(userWithRole.user),
            role: userWithRole.role,
        }));

        return [userDomainsWithRoles, count];
    }
}
