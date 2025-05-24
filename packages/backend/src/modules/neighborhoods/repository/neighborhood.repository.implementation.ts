import { DataSource } from 'typeorm';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { GetNeighborhoodQueryParams, Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';
import { isNotNull } from '../../../utils/tools';

export class NeighborhoodRepositoryImplementation implements NeighborhoodRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getAllNeighborhoods(
        params: GetNeighborhoodQueryParams,
        page: number,
        limit: number
    ): Promise<[Neighborhood[], number]> {
        const queryBuilder = this.dataSource
            .getRepository(NeighborhoodEntity)
            .createQueryBuilder('neighborhood')
            .leftJoinAndSelect('neighborhood.images', 'images');

        if (isNotNull(params.status)) {
            queryBuilder.andWhere('neighborhood.status = :status', {
                status: params.status,
            });
        }

        const [neighborhoods, count] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('neighborhood.id', 'ASC')
            .getManyAndCount();

        return [NeighborhoodsAdapter.listDatabaseToDomain(neighborhoods), count];
    }

    async getNeighborhoodById(id: number): Promise<Neighborhood | null> {
        const neighborhood = await this.dataSource
            .getRepository(NeighborhoodEntity)
            .createQueryBuilder('neighborhood')
            .leftJoinAndSelect('neighborhood.images', 'images')
            .leftJoinAndSelect('neighborhood.neighborhood_users', 'neighborhood_users')
            .where('neighborhood.id = :id', { id })
            .getOne();

        if (!neighborhood) {
            return null;
        }
        return NeighborhoodsAdapter.databaseToDomain(neighborhood);
    }

    async createNeighborhood(neighborhood: NeighborhoodEntity): Promise<Neighborhood> {
        const createdNeighborhood = await this.dataSource.getRepository(NeighborhoodEntity).save(neighborhood);
        return NeighborhoodsAdapter.databaseToDomain(createdNeighborhood);
    }
}
