import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood';
import type { NeighborhoodFormValues } from '@/containers/Neighborhood/neighborhood.schema';

export class NeighborhoodError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NeighborhoodError';
    }
}

export class NeighborhoodUc {
    constructor(private neighborhoodRepository: NeighborhoodFrontRepository) {}

    async createNeighborhood(data: NeighborhoodFormValues): Promise<FrontNeighborhood> {
        try {
            return await this.neighborhoodRepository.createNeighborhood(data);
        } catch (error) {
            if (error instanceof Error) {
                throw new NeighborhoodError(error.message);
            }
            throw new NeighborhoodError('Une erreur est survenue lors de la création du quartier');
        }
    }
}
