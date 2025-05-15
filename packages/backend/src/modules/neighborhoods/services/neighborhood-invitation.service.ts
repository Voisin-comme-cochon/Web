import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { NeighborhoodInvitationRepository } from '../domain/neighborhood-invitation.abstract.repository';
import { NeighborhoodInvitationCreation } from '../domain/neighborhood-invitation.model';
import { CochonError } from '../../../utils/CochonError';
import { isNull } from '../../../utils/tools';
import { MailerService } from '../../mailer/services/mailer.service';
import { Templates } from '../../mailer/domain/templates.enum';
import { UsersService } from '../../users/services/users.service';
import { NeighborhoodService } from './neighborhood.service';

export class NeighborhoodInvitationService {
    constructor(
        private readonly neighborhoodInvitationRepository: NeighborhoodInvitationRepository,
        private readonly neighborhoodService: NeighborhoodService,
        private readonly jwtService: JwtService,
        private readonly userService: UsersService,
        private readonly mailerService: MailerService
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

        const expiredAt = new Date(Date.now() + (invitation.durationInDays ?? 7) * 24 * 60 * 60 * 1000);

        if (invitation.email) {
            const sender = await this.userService.getUserById(invitation.createdBy);

            await this.mailerService.sendRawEmail({
                to: [invitation.email],
                subject: 'Vous avez été invité à rejoindre un quartier !',
                template: Templates.NEIGHBORHOOD_INVITATION,
                context: {
                    neighborhoodName: neighborhood.name,
                    inviterName: sender.firstName,
                    neighborhoodDescription: neighborhood.description,
                    invitationLink: `${process.env.VCC_FRONT_URL}/neighborhood/invite/${token}`,
                    linkExpirationDate: dayjs(expiredAt).format('DD/MM/YYYY'),
                    supportEmail: process.env.VCC_SUPPORT_EMAIL,
                },
            });
        }

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
