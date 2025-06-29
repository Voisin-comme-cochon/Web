import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { GetNeighborhoodQueryParams, Neighborhood } from './neighborhood.model';

export abstract class NeighborhoodRepository {
    abstract getNeighborhoodById(id: number): Promise<Neighborhood | null>;

    abstract getAllNeighborhoods(
        params: GetNeighborhoodQueryParams,
        page: number,
        limit: number
    ): Promise<[Neighborhood[], number]>;

    abstract createNeighborhood(neighborhood: NeighborhoodEntity): Promise<Neighborhood>;

    abstract setNeighborhoodStatus(id: number, status: NeighborhoodStatusEntity): Promise<Neighborhood | null>;

    abstract updateNeighborhood(id: number, name?: string, description?: string): Promise<Neighborhood | null>;
}
