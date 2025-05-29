import { DataSource } from 'typeorm';
import { NeighborhoodUserEntity } from '../../../core/entities/neighborhood-user.entity';
import { UserEntity } from '../../../core/entities/user.entity';
import { NeighborhoodUserRepository } from '../domain/neighborhood-user.abstract.repository';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';

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

    async getNeighborhoodsById(id: number): Promise<Neighborhood[]> {
        const neighborhoods = await this.dataSource
            .getRepository(NeighborhoodUserEntity)
            .createQueryBuilder('neighborhoodUser')
            .leftJoinAndSelect('neighborhoodUser.neighborhood', 'neighborhood')
            .leftJoinAndSelect('neighborhood.images', 'images')
            .leftJoinAndSelect('neighborhood.neighborhood_users', 'neighborhood_users')
            .leftJoinAndSelect('neighborhood_users.user', 'user')
            .where('neighborhoodUser.userId = :userId AND neighborhood.status = :status', {
                userId: id,
                status: 'accepted',
            })
            .getMany();

        const neighborhoodsEntity = neighborhoods.map((neighborhoodUser) => neighborhoodUser.neighborhood);
        return NeighborhoodsAdapter.listDatabaseToDomain(neighborhoodsEntity);
    }
}
