import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { Neighborhood } from './neighborhood.model';

export abstract class NeighborhoodRepository {
    abstract getALlNeighborhoods(
        status: NeighborhoodStatusEntity | null,
        limit: number,
        offset: number
    ): Promise<[Neighborhood[], number]>;

    abstract getNeighborhoodById(id: number): Promise<Neighborhood | null>;

    abstract createNeighborhood(neighborhood: NeighborhoodEntity): Promise<Neighborhood>;
}
