import { NeighborhoodInvitationRepository } from '../domain/neighborhood-invitation.abstract.repository';

export class NeighborhoodInvitationService {
    constructor(private neighborhoodInvitationRepository: NeighborhoodInvitationRepository) {}
}
