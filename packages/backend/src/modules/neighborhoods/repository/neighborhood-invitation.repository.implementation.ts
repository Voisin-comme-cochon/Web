import { DataSource } from 'typeorm';
import { NeighborhoodInvitationRepository } from '../domain/neighborhood-invitation.abstract.repository';
import { NeighborhoodInvitationCreation, NeighborhoodInvitation } from '../domain/neighborhood-invitation.model';
import { NeighborhoodInvitationEntity } from '../../../core/entities/neighborhood-invitation.entity';
import { NeighborhoodsInvitationAdapter } from '../adapters/neighborhood-invitation.adapter';

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

        if (!invitation) {
            return null;
        }

        return NeighborhoodsInvitationAdapter.entityToDomain(invitation);
    }
}
