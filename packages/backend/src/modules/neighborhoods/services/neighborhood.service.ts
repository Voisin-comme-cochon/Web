import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';

export class NeighborhoodService {
    constructor(private neighborhoodRepository: NeighborhoodRepository) {}

    async getAllNeighborhoods(status: NeighborhoodStatusEntity | null): Promise<Neighborhood[]> {
        if (!status || !Object.values(NeighborhoodStatusEntity).includes(status)) {
            status = null;
        }
        return this.neighborhoodRepository.getALlNeighborhoods(status);
    }
}
