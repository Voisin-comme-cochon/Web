import { UserModel } from '@/domain/models/user.model.ts';
import { UserFrontRepository } from '@/infrastructure/repositories/UserFrontRepository.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

export class HomeUc {
    constructor(
        private userFrontRepository: UserFrontRepository,
        private neighborhoodRepository: NeighborhoodFrontRepository
    ) {}

    async getUserById(id: string | number): Promise<UserModel> {
        try {
            return await this.userFrontRepository.getUserById(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la création du quartier');
        }
    }

    async getMyNeighborhoods(id: string | number): Promise<FrontNeighborhood[]> {
        try {
            return await this.neighborhoodRepository.getMyNeighborhoods(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération des quartiers');
        }
    }
}
