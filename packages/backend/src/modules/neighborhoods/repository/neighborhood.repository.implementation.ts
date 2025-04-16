import { DataSource } from 'typeorm';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';

export class NeighborhoodRepositoryImplementation implements NeighborhoodRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getALlNeighborhoods(status: NeighborhoodStatusEntity | null): Promise<Neighborhood[]> {
        const neighborhoods = await this.dataSource.getRepository(NeighborhoodEntity).find({
            where: {
                ...(status ? { status: status } : {}),
            },
        });
        return NeighborhoodsAdapter.listDatabaseToDomain(neighborhoods);
    }
}
