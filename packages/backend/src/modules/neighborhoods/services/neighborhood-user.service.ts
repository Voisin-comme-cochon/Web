import { isNotNull, isNull } from '../../../utils/tools';
import { CochonError } from '../../../utils/CochonError';
import { NeighborhoodUserRepository } from '../domain/neighborhood-user.abstract.repository';
import { UserAdapter } from '../../users/adapters/user.adapter';
import { User } from '../../users/domain/user.model';
import { UsersService } from '../../users/services/users.service';
import { Neighborhood } from '../domain/neighborhood.model';
import {
    NeighborhoodUserEntity,
    NeighborhoodUserRole,
    NeighborhoodUserStatus,
} from '../../../core/entities/neighborhood-user.entity';
import { NeighborhoodUserAdapter } from '../adapters/neighborhood-user.adapter';
import { MailerService } from '../../mailer/services/mailer.service';
import { Templates } from '../../mailer/domain/templates.enum';
import { NeighborhoodService } from './neighborhood.service';

export interface UserDomainWithRole {
    user: User;
    role: string;
}

export class NeighborhoodUserService {
    constructor(
        private readonly neighborhoodUserRepository: NeighborhoodUserRepository,
        private readonly neighborhoodService: NeighborhoodService,
        private readonly userService: UsersService,
        private readonly mailerService: MailerService
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
        return await this.neighborhoodUserRepository.getNeighborhoodsByUserId(userId);
    }

    async joinNeighborhood(userId: number, neighborhoodId: number) {
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

        const isUser = await this.neighborhoodUserRepository.getUserInNeighborhood(neighborhoodId, userId);
        if (isUser) {
            throw new CochonError('already_member', 'User is already a member of this neighborhood', 400, {
                userId,
                neighborhoodId,
            });
        }

        const neighborhoodUser = new NeighborhoodUserEntity();
        const neighborhoodCreators = await this.neighborhoodUserRepository.getUsersByRoleInNeighborhoodId(
            neighborhoodId,
            NeighborhoodUserRole.ADMIN
        );

        if (!neighborhoodCreators || neighborhoodCreators.length === 0) {
            throw new CochonError('no_admin_found', 'No admin found in this neighborhood, nobody can accept you', 400, {
                neighborhoodId,
            });
        }

        neighborhoodUser.neighborhoodId = neighborhoodId;
        neighborhoodUser.userId = userId;
        neighborhoodUser.status = 'pending';

        const addedUser = await this.neighborhoodUserRepository.addUserToNeighborhood(neighborhoodUser);

        await Promise.all(
            neighborhoodCreators.map((creator) =>
                this.mailerService.sendRawEmail({
                    to: [creator.user.email],
                    subject: "Nouvelle demande d'adhésion à votre quartier !",
                    template: Templates.NEIGHBORHOOD_JOIN_REQUEST,
                    context: {
                        neighborhoodName: neighborhood.name,
                        requesterName: user.firstName,
                        requesterEmail: user.email,
                        neighborhoodLink: `${process.env.VCC_FRONT_URL}/admin-neighborhood/${neighborhoodId}`,
                        supportEmail: process.env.VCC_SUPPORT_EMAIL,
                    },
                })
            )
        );

        return addedUser;
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

    async removeMemberFromNeighborhood(neighborhoodId: number, memberId: number, adminId: number): Promise<void> {
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404, {
                neighborhoodId,
            });
        }

        const checkAdmin = await this.neighborhoodUserRepository.getUserInNeighborhood(neighborhoodId, adminId);
        if (isNull(checkAdmin) || checkAdmin.role !== NeighborhoodUserRole.ADMIN.toString()) {
            throw new CochonError(
                'not_authorized',
                'You are not authorized to remove members from this neighborhood',
                403,
                {
                    userId: adminId,
                    neighborhoodId,
                }
            );
        }

        const neighborhoodUser = await this.neighborhoodUserRepository.getUserInNeighborhood(neighborhoodId, memberId);
        if (isNull(neighborhoodUser)) {
            throw new CochonError('user_not_in_neighborhood', 'User is not in this neighborhood', 400, {
                userId: memberId,
                neighborhoodId,
            });
        }

        if (neighborhoodUser.role === NeighborhoodUserRole.ADMIN.toString()) {
            throw new CochonError('cannot_remove_admin', 'You cannot remove an admin from this neighborhood', 400, {
                userId: memberId,
                neighborhoodId,
            });
        }

        return this.neighborhoodUserRepository.removeUserFromNeighborhood(neighborhoodUser.user.id, neighborhoodId);
    }

    async updateMemberInNeighborhood(
        neighborhoodId: number,
        memberId: number,
        adminId: number,
        role?: NeighborhoodUserRole,
        status?: NeighborhoodUserStatus
    ): Promise<NeighborhoodUserEntity> {
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404, {
                neighborhoodId,
            });
        }

        const checkAdmin = await this.neighborhoodUserRepository.getUserInNeighborhood(neighborhoodId, adminId);
        if (isNull(checkAdmin) || checkAdmin.role !== NeighborhoodUserRole.ADMIN.toString()) {
            throw new CochonError(
                'not_authorized',
                'You are not authorized to update members in this neighborhood',
                403,
                {
                    userId: adminId,
                    neighborhoodId,
                }
            );
        }

        const neighborhoodUser = await this.neighborhoodUserRepository.getUserInNeighborhood(neighborhoodId, memberId);
        if (isNull(neighborhoodUser)) {
            throw new CochonError('user_not_in_neighborhood', 'User is not in this neighborhood', 400, {
                userId: memberId,
                neighborhoodId,
            });
        }

        return this.neighborhoodUserRepository.updateMemberInNeighborhood(neighborhoodId, memberId, role, status);
    }
}
