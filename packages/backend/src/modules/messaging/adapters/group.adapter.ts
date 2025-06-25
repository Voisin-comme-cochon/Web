import { GroupEntity, GroupTypeEntity } from '../../../core/entities/group.entity';
import { Group, GroupType } from '../domain/group.model';

export class GroupAdapter {
    static entityToDomain(entity: GroupEntity): Group {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            type: entity.type as unknown as GroupType,
            isPrivate: entity.isPrivate,
            neighborhoodId: entity.neighborhoodId,
            tagId: entity.tagId,
            imageUrl: entity.imageUrl,
            createdAt: entity.createdAt,
            memberCount: (entity as { memberCount?: number }).memberCount ?? 0,

            lastMessage:
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                entity.messages && entity.messages.length > 0
                    ? {
                          id: entity.messages[0].id,
                          content: entity.messages[0].content,
                          userId: entity.messages[0].userId,
                          groupId: entity.messages[0].groupId,
                          createdAt: entity.messages[0].createdAt,
                          user: entity.messages[0].user,
                      }
                    : undefined,
        };
    }

    static listEntityToDomain(entities: GroupEntity[]): Group[] {
        return entities.map((entity) => this.entityToDomain(entity));
    }

    static domainToEntity(domain: Group): Partial<GroupEntity> {
        return {
            id: domain.id,
            name: domain.name,
            description: domain.description,
            type: domain.type as unknown as GroupTypeEntity,
            isPrivate: domain.isPrivate,
            neighborhoodId: domain.neighborhoodId,
            tagId: domain.tagId,
            imageUrl: domain.imageUrl,
        };
    }
}
