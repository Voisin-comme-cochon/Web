import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';

export class NeighborhoodService {
    constructor(private neighborhoodRepository: NeighborhoodRepository) {}
}
