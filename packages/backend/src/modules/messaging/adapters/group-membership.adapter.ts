import { GroupMembershipEntity, MembershipStatusEntity } from '../../../core/entities/group-membership.entity';
import { GroupMembership, InviteGroupMembership, MembershipStatus } from '../domain/group-membership.model';
import { InviteToGroupDto } from '../controllers/dto/messaging.dto';

export class GroupMembershipAdapter {
    static entityToDomain(entity: GroupMembershipEntity): GroupMembership {
        return {
            id: entity.id,
            userId: entity.userId,
            groupId: entity.groupId,
            status: this.membershipStatusEntityToDomain(entity.status),
            isOwner: entity.isOwner,
            user: entity.user,
        };
    }

    static listEntityToDomain(entities: GroupMembershipEntity[]): GroupMembership[] {
        return entities.map((entity) => this.entityToDomain(entity));
    }

    static inviteDtoToDomain(dto: InviteToGroupDto): InviteGroupMembership {
        return {
            groupId: dto.groupId,
            userIds: dto.userIds,
        };
    }

    static membershipStatusDomainToEntity(status: MembershipStatus): MembershipStatusEntity {
        switch (status) {
            case MembershipStatus.PENDING:
                return MembershipStatusEntity.PENDING;
            case MembershipStatus.ACTIVE:
                return MembershipStatusEntity.ACTIVE;
            case MembershipStatus.DECLINED:
                return MembershipStatusEntity.DECLINED;
        }
    }

    static membershipStatusEntityToDomain(status: MembershipStatusEntity): MembershipStatus {
        switch (status) {
            case MembershipStatusEntity.PENDING:
                return MembershipStatus.PENDING;
            case MembershipStatusEntity.ACTIVE:
                return MembershipStatus.ACTIVE;
            case MembershipStatusEntity.DECLINED:
                return MembershipStatus.DECLINED;
        }
    }
}
