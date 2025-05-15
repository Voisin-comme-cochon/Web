import { Injectable } from '@nestjs/common';
import { ResponseNeighborhoodDto } from '../controllers/dto/neighborhood.dto';
import { NeighborhoodService } from './neighborhood.service';
import { NeighborhoodInvitationService } from './neighborhood-invitation.service';

interface CreateAndInviteInput {
    name: string;
    description: string;
    geo: string;
    files: Express.Multer.File[];
    userId: number;
    inviteEmails?: string[];
}

@Injectable()
export class NeighborhoodAppService {
    constructor(
        private readonly neighborhoodService: NeighborhoodService,
        private readonly neighborhoodInvitationService: NeighborhoodInvitationService
    ) {}

    async createNeighborhoodAndInvite(input: CreateAndInviteInput): Promise<ResponseNeighborhoodDto> {
        const { inviteEmails, ...rest } = input;

        // 1. Création du quartier
        const neighborhood = await this.neighborhoodService.createNeighborhood(rest);

        // 2. Envoi des invitations
        if (inviteEmails && inviteEmails.length > 0) {
            for (const email of inviteEmails) {
                await this.neighborhoodInvitationService.createInvitation({
                    neighborhoodId: neighborhood.id,
                    createdBy: input.userId,
                    email,
                    // durée par défaut à 7 jours, ajustable
                    durationInDays: 7,
                });
            }
        }

        return neighborhood;
    }
}
