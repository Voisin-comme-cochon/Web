import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { NeighborhoodInvitationRepository } from '../domain/neighborhood-invitation.abstract.repository';
import {
    CreateMultipleInvitationsInput,
    CreatePublicInvitationInput,
    NeighborhoodInvitation,
    NeighborhoodInvitationCreation,
} from '../domain/neighborhood-invitation.model';
import { CochonError } from '../../../utils/CochonError';
import { isNull } from '../../../utils/tools';
import { MailerService } from '../../mailer/services/mailer.service';
import { Templates } from '../../mailer/domain/templates.enum';
import { UsersService } from '../../users/services/users.service';
import { NeighborhoodUserRole } from '../../../core/entities/neighborhood-user.entity';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';
import {
    NeighborhoodMemberDto,
    ResponseNeighborhoodWithMembersDto,
} from '../controllers/dto/neighborhood-invitation.dto';
import { NeighborhoodService } from './neighborhood.service';
import { NeighborhoodUserService } from './neighborhood-user.service';

export class NeighborhoodInvitationService {
    constructor(
        private readonly neighborhoodInvitationRepository: NeighborhoodInvitationRepository,
        private readonly neighborhoodService: NeighborhoodService,
        private readonly neighborhoodUserService: NeighborhoodUserService,
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
                    inviterName: sender.firstName + ' ' + sender.lastName,
                    neighborhoodDescription: neighborhood.description,
                    invitationLink: `${process.env.VCC_FRONT_URL}/neighborhoods/invite/${token}`,
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

    async createMultipleInvitations(input: CreateMultipleInvitationsInput) {
        const { neighborhoodId, emails, createdBy, durationInDays } = input;

        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
        if (!neighborhood) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        const isAdmin = neighborhood.neighborhood_users?.some(
            (user) => user.userId === createdBy && user.role === NeighborhoodUserRole.ADMIN
        );

        if (!isAdmin) {
            throw new CochonError(
                'can_not_create_multiple_invitations',
                'Only neighborhood admins can create invitations',
                403
            );
        }

        const invitations = [];
        for (const email of emails) {
            const invitation = await this.createInvitation({
                neighborhoodId,
                createdBy,
                email,
                durationInDays,
            });
            invitations.push(invitation);
        }

        return invitations;
    }

    async createPublicInvitation(input: CreatePublicInvitationInput) {
        const { neighborhoodId, createdBy, maxUse, durationInDays } = input;

        const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
        if (!neighborhood) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        const isAdmin = neighborhood.neighborhood_users?.some(
            (user) => user.userId === createdBy && user.role === NeighborhoodUserRole.ADMIN
        );

        if (!isAdmin) {
            throw new CochonError(
                'can_not_create_public_invitation',
                'Only neighborhood admins can create invitations',
                403
            );
        }

        const token = this.generateInvitationToken(createdBy, neighborhoodId, durationInDays ?? 7);

        const expiredAt = new Date(Date.now() + (durationInDays ?? 7) * 24 * 60 * 60 * 1000);

        const invitation = await this.neighborhoodInvitationRepository.insertInvitation({
            neighborhoodId,
            createdBy,
            maxUse,
            token,
            expiredAt,
        });

        return {
            ...invitation,
            invitationLink: `${process.env.VCC_FRONT_URL}/neighborhoods/invite/${token}`,
            expiresAt: expiredAt,
        };
    }

    async verifyInvitationTokenWithMembers(token: string, userId: number): Promise<ResponseNeighborhoodWithMembersDto> {
        await this.commonVerifyInvitation(token, userId);

        const invitation = await this.findInvitationByToken(token);
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(invitation.neighborhoodId);

        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        const usersWithRoles = await this.neighborhoodUserService.getAllMembersByNeighborhood(
            invitation.neighborhoodId
        );

        const neighborhoodDto = NeighborhoodsAdapter.domainToDto(neighborhood);
        const members: NeighborhoodMemberDto[] = usersWithRoles.map((userWithRole) => ({
            id: userWithRole.user.id,
            firstName: userWithRole.user.firstName,
            lastName: userWithRole.user.lastName,
            profileImageUrl: userWithRole.user.profileImageUrl,
            neighborhoodRole: userWithRole.role,
        }));

        const response = new ResponseNeighborhoodWithMembersDto();
        response.id = neighborhoodDto.id;
        response.name = neighborhoodDto.name;
        response.status = neighborhoodDto.status;
        response.description = neighborhoodDto.description;
        response.creationDate = neighborhoodDto.creationDate;
        response.geo = neighborhoodDto.geo;
        response.images = neighborhoodDto.images;
        response.members = members;

        return response;
    }

    async acceptInvitation(token: string, userId: number): Promise<boolean> {
        await this.commonVerifyInvitation(token, userId);

        const invitation = await this.findInvitationByToken(token);
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(invitation.neighborhoodId);

        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        await this.neighborhoodUserService.addUserToNeighborhood(neighborhood.id, userId, NeighborhoodUserRole.USER);

        if (invitation.maxUse) {
            await this.neighborhoodInvitationRepository.incrementInvitationUsage(token);
        }

        return true;
    }

    async getInvitationsByNeighborhoodId(neighborhoodId: number): Promise<NeighborhoodInvitation[]> {
        return await this.neighborhoodInvitationRepository.getInvitationsByNeighborhoodId(neighborhoodId);
    }

    private generateInvitationToken(userId: number, neighborhoodId: number, durationInDays: number): string {
        const payload = { userId, neighborhoodId };
        return this.jwtService.sign(payload, {
            expiresIn: `${durationInDays}d`,
        });
    }

    private async commonVerifyInvitation(token: string, userId: number): Promise<void> {
        this.verifyJWTToken(token);

        const invitation = await this.findInvitationByToken(token);

        if (isNull(invitation)) {
            throw new CochonError('invitation_not_found', 'Invitation not found', 404);
        }

        if (invitation.expiredAt < new Date()) {
            throw new CochonError('invitation_expired', 'Invitation has expired', 410);
        }

        if (invitation.usedCount && invitation.maxUse && invitation.usedCount >= invitation.maxUse) {
            throw new CochonError('invitation_max_use_reached', 'Invitation max use reached', 410);
        }

        const neighborhood = await this.neighborhoodService.getNeighborhoodById(invitation.neighborhoodId);
        if (isNull(neighborhood)) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        const isUserAlreadyMember = neighborhood.neighborhood_users?.some((user) => user.userId === userId);

        if (isUserAlreadyMember) {
            throw new CochonError('user_already_member', 'User is already a member of the neighborhood', 400);
        }
    }

    private verifyJWTToken(token: string): void {
        try {
            this.jwtService.verify(token);
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                throw new CochonError('invalid_token', 'Invalid invitation token', 400);
            }
            throw error;
        }
    }
}
