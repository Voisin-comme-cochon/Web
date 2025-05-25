import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import type { CreateMultipleInvitationsInput } from '@/domain/models/NeighborhoodInvitation';

export class NeighborhoodInvitationUc {
    constructor(private neighborhoodRepository: NeighborhoodFrontRepository) {}

    async createMultipleInvitations(input: CreateMultipleInvitationsInput) {
        return await this.neighborhoodRepository.createMultipleInvitations(input);
    }
}
