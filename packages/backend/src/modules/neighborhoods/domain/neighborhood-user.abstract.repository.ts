import { UserWithRole } from '../repository/neighborhood-user.repository.implementation';
import { Neighborhood } from './neighborhood.model';

export abstract class NeighborhoodUserRepository {
    abstract getUsersByNeighborhood(
        neighborhoodId: number,
        page?: number,
        limit?: number
    ): Promise<[UserWithRole[], number]>;

    abstract getNeighborhoodsById(id: number): Promise<Neighborhood[]>;
}
