import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import type { CreateMultipleInvitationsInput } from '@/domain/models/NeighborhoodInvitation';

export class NeighborhoodInvitationUc {
    constructor(private neighborhoodRepository: NeighborhoodFrontRepository) {}

    async createMultipleInvitations(input: CreateMultipleInvitationsInput) {
        return await this.neighborhoodRepository.createMultipleInvitations(input);
    }

    async verifyInvitation(token: string) {
        return await this.neighborhoodRepository.verifyInvitation(token);
    }

    async acceptInvitation(token: string) {
        return await this.neighborhoodRepository.acceptInvitation(token);
    }
}
