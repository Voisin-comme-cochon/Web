import { NeighborhoodUserRepository } from '../domain/neighborhood-user.abstract.repository';

export class NeighborhoodUserService {
    constructor(private neighborhoodUserRepository: NeighborhoodUserRepository) {}
}
