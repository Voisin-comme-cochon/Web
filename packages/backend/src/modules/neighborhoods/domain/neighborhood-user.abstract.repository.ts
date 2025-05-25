import { UserWithRole } from '../repository/neighborhood-user.repository.implementation';

export abstract class NeighborhoodUserRepository {
    abstract getUsersByNeighborhood(
        neighborhoodId: number,
        page?: number,
        limit?: number
    ): Promise<[UserWithRole[], number]>;
}
