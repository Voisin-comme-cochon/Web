import { JwtService } from '@nestjs/jwt';
import { NeighborhoodInvitationRepository } from '../domain/neighborhood-invitation.abstract.repository';
import { NeighborhoodInvitationCreation } from '../domain/neighborhood-invitation.model';
import { CochonError } from '../../../utils/CochonError';
import { isNull } from '../../../utils/tools';
import { NeighborhoodService } from '../../neighborhoods/services/neighborhood.service';

export class NeighborhoodInvitationService {
    constructor(
        private neighborhoodInvitationRepository: NeighborhoodInvitationRepository,
        private neighborhoodService: NeighborhoodService,
        private jwtService: JwtService
    ) {}

    async createInvitation(invitation: NeighborhoodInvitationCreation) {
        if (isNull(invitation.createdBy)) {
            throw new CochonError('missing_created_by', 'Missing createdBy field', 400);
        }

        const neighborhood = await this.neighborhoodService.getNeighborhoodById(invitation.neighborhoodId);

        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        const token = this.generateInvitationToken(
            invitation.createdBy,
            invitation.neighborhoodId,
            invitation.durationInDays ?? 7
        );

        // Generate expiredAt date
        const expiredAt = new Date(Date.now() + (invitation.durationInDays ?? 7) * 24 * 60 * 60 * 1000);

        // TODO : Send email to the user with the invitation link

        return this.neighborhoodInvitationRepository.insertInvitation({ ...invitation, token, expiredAt });
    }

    async findInvitationByToken(token: string) {
        const invitation = await this.neighborhoodInvitationRepository.findInvitationByToken(token);
        if (!invitation) {
            throw new CochonError('invitation_not_found', 'Invitation not found', 404);
        }

        return invitation;
    }

    private generateInvitationToken(userId: number, neighborhoodId: number, durationInDays: number): string {
        const payload = { userId, neighborhoodId };
        return this.jwtService.sign(payload, {
            expiresIn: `${durationInDays}d`,
        });
    }
}
