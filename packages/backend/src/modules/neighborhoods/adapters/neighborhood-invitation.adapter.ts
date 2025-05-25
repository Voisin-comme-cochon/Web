import { NeighborhoodInvitationEntity } from '../../../core/entities/neighborhood-invitation.entity';
import { NeighborhoodInvitation } from '../domain/neighborhood-invitation.model';

export class NeighborhoodsInvitationAdapter {
    static entityToDomain(entity: NeighborhoodInvitationEntity): NeighborhoodInvitation {
        return {
            id: entity.id,
            neighborhoodId: entity.neighborhoodId,
            createdBy: entity.createdBy,
            token: entity.token,
            maxUse: entity.maxUse,
            usedCount: entity.currentUse,
            expiredAt: entity.expiredAt,
            creationDate: entity.createdAt,
        };
    }
}
