import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { Neighborhood } from './neighborhood.model';

export abstract class NeighborhoodRepository {
    abstract getALlNeighborhoods(status: NeighborhoodStatusEntity | null): Promise<Neighborhood[]>;
}
