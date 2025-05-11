import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { GetNeighborhoodQueryParams, Neighborhood } from './neighborhood.model';

export abstract class NeighborhoodRepository {
    abstract getAllNeighborhoods(
        params: GetNeighborhoodQueryParams,
        page: number,
        limit: number
    ): Promise<[Neighborhood[], number]>;

    abstract createNeighborhood(neighborhood: NeighborhoodEntity): Promise<Neighborhood>;
}
