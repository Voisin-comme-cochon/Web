import { Geography } from 'typeorm';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';

export class NeighborhoodService {
    constructor(private neighborhoodRepository: NeighborhoodRepository) {}

    async getAllNeighborhoods(status: NeighborhoodStatusEntity | null): Promise<Neighborhood[]> {
        if (!status || !Object.values(NeighborhoodStatusEntity).includes(status)) {
            status = null;
        }
        return this.neighborhoodRepository.getALlNeighborhoods(status);
    }

    async createNeighborhood(name: string, description: string, geo: Geography, owner: string): Promise<Neighborhood> {
        const insertedNeighborhood: NeighborhoodEntity = {
            id: 0,
            name,
            description,
            geo,
            creationDate: new Date(),
            status: NeighborhoodStatusEntity.waiting,
        };
        console.log(owner);
        // TODO : Intégrer les users et les photos
        return this.neighborhoodRepository.createNeighborhood(insertedNeighborhood);
    }
}
