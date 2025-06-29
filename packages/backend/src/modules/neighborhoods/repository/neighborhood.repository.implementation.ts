import { DataSource } from 'typeorm';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { GetNeighborhoodQueryParams, Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';
import { isNotNull } from '../../../utils/tools';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';

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

        if (isNotNull(params.lat) && isNotNull(params.lng)) {
            // Filtrer les quartiers dont la géométrie contient le point GPS donné (params.lat, params.lng)
            queryBuilder.andWhere(
                `ST_Contains(neighborhood.geo::geometry, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))`,
                {
                    lat: params.lat,
                    lng: params.lng,
                }
            );
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

    async setNeighborhoodStatus(id: number, status: NeighborhoodStatusEntity): Promise<Neighborhood | null> {
        await this.dataSource.getRepository(NeighborhoodEntity).update(
            {
                id: id,
            },
            { status: status }
        );

        const updatedNeighborhood = await this.dataSource.getRepository(NeighborhoodEntity).findOne({
            where: { id: id },
            relations: ['images', 'neighborhood_users'],
        });

        if (!updatedNeighborhood) {
            return null;
        }
        return NeighborhoodsAdapter.databaseToDomain(updatedNeighborhood);
    }

    async updateNeighborhood(id: number, name?: string, description?: string): Promise<Neighborhood | null> {
        const query = this.dataSource.getRepository(NeighborhoodEntity);
        const neighborhood = await query.findOne({ where: { id: id } });
        if (!neighborhood) {
            return null;
        }
        if (name) {
            neighborhood.name = name;
        }
        if (description) {
            neighborhood.description = description;
        }
        const updatedNeighborhood = await query.save(neighborhood);
        updatedNeighborhood.neighborhood_users = [];
        return NeighborhoodsAdapter.databaseToDomain(updatedNeighborhood);
    }
}
