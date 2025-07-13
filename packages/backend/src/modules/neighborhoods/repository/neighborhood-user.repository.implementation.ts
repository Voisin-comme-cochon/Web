import { DataSource } from 'typeorm';
import {
    NeighborhoodUserEntity,
    NeighborhoodUserRole,
    NeighborhoodUserStatus,
} from '../../../core/entities/neighborhood-user.entity';
import { UserEntity } from '../../../core/entities/user.entity';
import { NeighborhoodUserRepository } from '../domain/neighborhood-user.abstract.repository';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';
import { NeighborhoodMemberModel } from '../domain/neighborhood-member.model';

export interface UserWithRole {
    user: UserEntity;
    role: string;
}

export class NeighborhoodUserRepositoryImplementation implements NeighborhoodUserRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getUsersByNeighborhood(neighborhoodId: number, page = 1, limit = 10): Promise<[UserWithRole[], number]> {
        const skip = (page - 1) * limit;

        const queryBuilder = this.dataSource
            .getRepository(NeighborhoodUserEntity)
            .createQueryBuilder('neighborhood_users')
            .leftJoinAndSelect('neighborhood_users.user', 'user')
            .where('neighborhood_users.neighborhoodId = :neighborhoodId', { neighborhoodId });

        const [neighborhoodUsers, count] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

        const usersWithRoles = neighborhoodUsers.map((neighborhoodUser) => ({
            user: neighborhoodUser.user,
            role: neighborhoodUser.role,
        }));

        return [usersWithRoles, count];
    }

    async getUserStatusInNeighborhood(neighborhoodId: number, userId: number): Promise<NeighborhoodUserStatus | null> {
        const neighborhoodUser = await this.dataSource.getRepository(NeighborhoodUserEntity).findOne({
            where: { neighborhoodId, userId },
            select: ['status'],
        });

        return neighborhoodUser ? (neighborhoodUser.status as NeighborhoodUserStatus) : null;
    }

    async getMemberUsersByNeighborhood(
        neighborhoodId: number,
        roleFilter?: NeighborhoodUserRole,
        statusFilter?: NeighborhoodUserStatus
    ): Promise<NeighborhoodMemberModel[]> {
        const neighborhoodUsers = await this.dataSource.getRepository(NeighborhoodUserEntity).find({
            where: {
                neighborhoodId,
                ...(roleFilter ? { role: roleFilter } : {}),
                ...(statusFilter ? { status: statusFilter } : {}),
            },
            relations: ['user'],
        });

        return await Promise.all(
            neighborhoodUsers.map((neighborhoodUser) => ({
                id: neighborhoodUser.id,
                neighborhoodId: neighborhoodUser.neighborhoodId,
                userId: neighborhoodUser.userId,
                firstName: neighborhoodUser.user.firstName,
                lastName: neighborhoodUser.user.lastName,
                role: neighborhoodUser.role as NeighborhoodUserRole,
                status: neighborhoodUser.status as NeighborhoodUserStatus,
            }))
        );
    }

    async getUsersInNeighborhoodByStatus(
        neighborhoodId: number,
        status: NeighborhoodUserStatus
    ): Promise<[UserWithRole[], number]> {
        const queryBuilder = this.dataSource
            .getRepository(NeighborhoodUserEntity)
            .createQueryBuilder('neighborhood_users')
            .leftJoinAndSelect('neighborhood_users.user', 'user')
            .where('neighborhood_users.neighborhoodId = :neighborhoodId', { neighborhoodId })
            .andWhere('neighborhood_users.status = :status', { status });

        const [neighborhoodUsers, count] = await queryBuilder.getManyAndCount();

        const usersWithRoles = neighborhoodUsers.map((neighborhoodUser) => ({
            user: neighborhoodUser.user,
            role: neighborhoodUser.role,
        }));

        return [usersWithRoles, count];
    }

    async getUsersByRoleInNeighborhoodId(
        neighborhoodId: number,
        role: NeighborhoodUserRole
    ): Promise<UserWithRole[] | null> {
        return this.dataSource
            .getRepository(NeighborhoodUserEntity)
            .find({
                where: {
                    neighborhoodId,
                    role,
                },
                relations: ['user'],
            })
            .then((neighborhoodUsers) => {
                if (neighborhoodUsers.length === 0) {
                    return null;
                }
                return neighborhoodUsers.map((neighborhoodUser) => ({
                    user: neighborhoodUser.user,
                    role: neighborhoodUser.role,
                }));
            });
    }

    async getUserInNeighborhood(neighborhoodId: number, userId: number): Promise<UserWithRole | null> {
        const neighborhoodUser = await this.dataSource
            .getRepository(NeighborhoodUserEntity)
            .createQueryBuilder('neighborhood_users')
            .leftJoinAndSelect('neighborhood_users.user', 'user')
            .where('neighborhood_users.neighborhoodId = :neighborhoodId', { neighborhoodId })
            .andWhere('neighborhood_users.userId = :userId', { userId })
            .getOne();

        if (!neighborhoodUser) {
            return null;
        }

        return {
            user: neighborhoodUser.user,
            role: neighborhoodUser.role,
        };
    }

    async getNeighborhoodsByUserId(id: number): Promise<Neighborhood[]> {
        const neighborhoods = await this.dataSource
            .getRepository(NeighborhoodUserEntity)
            .createQueryBuilder('neighborhoodUser')
            .leftJoinAndSelect('neighborhoodUser.neighborhood', 'neighborhood')
            .leftJoinAndSelect('neighborhood.images', 'images')
            .leftJoinAndSelect('neighborhood.neighborhood_users', 'neighborhood_users')
            .leftJoinAndSelect('neighborhood_users.user', 'user')
            .where(
                'neighborhoodUser.userId = :userId AND neighborhood.status = :status AND neighborhoodUser.status = :userStatus',
                {
                    userId: id,
                    status: 'accepted',
                    userStatus: 'accepted',
                }
            )
            .getMany();

        const neighborhoodsEntity = neighborhoods.map((neighborhoodUser) => neighborhoodUser.neighborhood);
        return NeighborhoodsAdapter.listDatabaseToDomain(neighborhoodsEntity);
    }

    async addUserToNeighborhood(neighborhoodUser: NeighborhoodUserEntity): Promise<NeighborhoodUserEntity> {
        const repository = this.dataSource.getRepository(NeighborhoodUserEntity);
        return repository.save(neighborhoodUser);
    }

    async removeUserFromNeighborhood(userId: number, neighborhoodId: number): Promise<void> {
        const neighborhoodUser = await this.dataSource
            .getRepository(NeighborhoodUserEntity)
            .findOneBy({ userId, neighborhoodId });
        if (!neighborhoodUser) {
            throw new Error(`User with ID ${userId} is not a member of neighborhood ${neighborhoodId}`);
        }

        await this.dataSource.getRepository(NeighborhoodUserEntity).remove(neighborhoodUser);
    }

    async updateMemberInNeighborhood(
        neighborhoodId: number,
        userId: number,
        role?: NeighborhoodUserRole,
        status?: NeighborhoodUserStatus
    ): Promise<NeighborhoodUserEntity> {
        const repository = this.dataSource.getRepository(NeighborhoodUserEntity);
        const neighborhoodUser = await repository.findOneBy({ neighborhoodId, userId });

        if (!neighborhoodUser) {
            throw new Error('Neighborhood user not found');
        }

        if (role) {
            neighborhoodUser.role = role;
        }
        if (status) {
            neighborhoodUser.status = status;
        }

        return repository.save(neighborhoodUser);
    }

    async isUserMemberOfNeighborhood(userId: number, neighborhoodId: number): Promise<boolean> {
        const count = await this.dataSource.getRepository(NeighborhoodUserEntity).count({
            where: {
                userId,
                neighborhoodId,
                status: 'accepted',
            },
        });

        return count > 0;
    }
}
