import { isNotNull, isNull } from '../../../utils/tools';
import { CochonError } from '../../../utils/CochonError';
import { NeighborhoodUserRepository } from '../domain/neighborhood-user.abstract.repository';
import { UserAdapter } from '../../users/adapters/user.adapter';
import { User } from '../../users/domain/user.model';
import { UsersService } from '../../users/services/users.service';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodUserEntity } from '../../../core/entities/neighborhood-user.entity';
import { NeighborhoodUserAdapter } from '../adapters/neighborhood-user.adapter';
import { NeighborhoodService } from './neighborhood.service';

export interface UserDomainWithRole {
    user: User;
    role: string;
}

export class NeighborhoodUserService {
    constructor(
        private readonly neighborhoodUserRepository: NeighborhoodUserRepository,
        private readonly neighborhoodService: NeighborhoodService,
        private readonly userService: UsersService
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

        await Promise.all(
            usersWithRoles.map(async (user) => {
                if (isNotNull(user.user.profileImageUrl)) {
                    user.user.profileImageUrl = await this.userService.replaceUrlByLink(user.user.profileImageUrl);
                }
            })
        );

        const userDomainsWithRoles = usersWithRoles.map((userWithRole) => ({
            user: UserAdapter.entityToDomain(userWithRole.user),
            role: userWithRole.role,
        }));

        return [userDomainsWithRoles, count];
    }

    async getNeighborhoodsByUserId(userId: number): Promise<Neighborhood[]> {
        return await this.neighborhoodUserRepository.getNeighborhoodsById(userId);
    }

    async addUserToNeighborhood(neighborhoodId: number, userId: number, role: string): Promise<NeighborhoodUserEntity> {
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404, {
                neighborhoodId,
            });
        }

        const user = await this.userService.getUserById(userId);
        if (isNull(user)) {
            throw new CochonError('user_not_found', 'User not found', 404, { userId });
        }

        const neighborhoodUser = new NeighborhoodUserEntity();
        neighborhoodUser.neighborhoodId = neighborhoodId;
        neighborhoodUser.userId = userId;
        neighborhoodUser.role = role;

        return this.neighborhoodUserRepository.addUserToNeighborhood(neighborhoodUser);
    }

    async getAllMembersByNeighborhood(neighborhoodId: number): Promise<UserDomainWithRole[]> {
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404, {
                neighborhoodId,
            });
        }

        const [usersWithRoles] = await this.neighborhoodUserRepository.getUsersByNeighborhood(neighborhoodId, 1, 1000);

        await Promise.all(
            usersWithRoles.map(async (user) => {
                if (isNotNull(user.user.profileImageUrl)) {
                    user.user.profileImageUrl = await this.userService.replaceUrlByLink(user.user.profileImageUrl);
                }
            })
        );

        return usersWithRoles
            .sort((a, b) => {
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (a.role !== 'admin' && b.role === 'admin') return 1;
                return 0;
            })
            .map((userWithRole) => ({
                user: UserAdapter.entityToDomain(userWithRole.user),
                role: NeighborhoodUserAdapter.toReadableRole(userWithRole.role),
            }));
    }
}
