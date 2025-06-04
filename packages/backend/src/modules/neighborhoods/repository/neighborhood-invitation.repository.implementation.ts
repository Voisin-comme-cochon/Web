import { DataSource } from 'typeorm';
import { NeighborhoodInvitationRepository } from '../domain/neighborhood-invitation.abstract.repository';
import { NeighborhoodInvitationCreation, NeighborhoodInvitation } from '../domain/neighborhood-invitation.model';
import { NeighborhoodInvitationEntity } from '../../../core/entities/neighborhood-invitation.entity';
import { NeighborhoodsInvitationAdapter } from '../adapters/neighborhood-invitation.adapter';
import { isNull } from '../../../utils/tools';
import { CochonError } from '../../../utils/CochonError';

export class NeighborhoodInvitationRepositoryImplementation implements NeighborhoodInvitationRepository {
    constructor(private readonly dataSource: DataSource) {}

    async insertInvitation(invitation: NeighborhoodInvitationCreation): Promise<NeighborhoodInvitation> {
        const createdInvitation = await this.dataSource.getRepository(NeighborhoodInvitationEntity).save(invitation);
        return NeighborhoodsInvitationAdapter.entityToDomain(createdInvitation);
    }

    async findInvitationByToken(token: string): Promise<NeighborhoodInvitation | null> {
        const invitation = await this.dataSource.getRepository(NeighborhoodInvitationEntity).findOne({
            where: { token },
        });

        if (isNull(invitation)) {
            return null;
        }

        return NeighborhoodsInvitationAdapter.entityToDomain(invitation);
    }

    async incrementInvitationUsage(token: string): Promise<void> {
        const invitationRepository = this.dataSource.getRepository(NeighborhoodInvitationEntity);
        const invitation = await invitationRepository.findOne({ where: { token } });

        if (isNull(invitation)) {
            throw new CochonError('invitation_not_found', 'Invitation not found', 404);
        }

        invitation.currentUse += 1;
        await invitationRepository.save(invitation);
    }
}
