import { GroupMembershipEntity } from '../../../core/entities/group-membership.entity';
import { GroupMembership, MembershipStatus } from '../domain/group-membership.model';

export class GroupMembershipAdapter {
    static entityToDomain(entity: GroupMembershipEntity): GroupMembership {
        return {
            id: entity.id,
            userId: entity.userId,
            groupId: entity.groupId,
            status: entity.status as MembershipStatus,
            user: entity.user,
        };
    }

    static listEntityToDomain(entities: GroupMembershipEntity[]): GroupMembership[] {
        return entities.map((entity) => this.entityToDomain(entity));
    }
}
