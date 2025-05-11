import { DataSource } from 'typeorm';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';

export class NeighborhoodRepositoryImplementation implements NeighborhoodRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getALlNeighborhoods(
        status: NeighborhoodStatusEntity | null,
        limit: number,
        offset: number
    ): Promise<[Neighborhood[], number]> {
        const [neighborhoods, count] = await this.dataSource.getRepository(NeighborhoodEntity).findAndCount({
            where: {
                ...(status ? { status: status } : {}),
            },
            skip: offset,
            take: limit,
        });
        const domainNeighborhoods = NeighborhoodsAdapter.listDatabaseToDomain(neighborhoods);
        return [domainNeighborhoods, count];
    }

    async getNeighborhoodById(id: number): Promise<Neighborhood | null> {
        const neighborhood = await this.dataSource.getRepository(NeighborhoodEntity).findOne({
            where: { id: id },
        });
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
