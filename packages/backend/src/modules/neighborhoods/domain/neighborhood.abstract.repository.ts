import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { Neighborhood } from './neighborhood.model';

export abstract class NeighborhoodRepository {
    abstract getALlNeighborhoods(status: NeighborhoodStatusEntity | null): Promise<Neighborhood[]>;

    abstract createNeighborhood(neighborhood: NeighborhoodEntity): Promise<Neighborhood>;
}
