import { GroupMessageEntity } from '../../../core/entities/group-message.entity';
import { GroupMessage } from '../domain/group-message.model';

export class GroupMessageAdapter {
    static entityToDomain(entity: GroupMessageEntity): GroupMessage {
        return {
            id: entity.id,
            content: entity.content,
            userId: entity.userId,
            groupId: entity.groupId,
            createdAt: entity.createdAt,
            user: entity.user,
        };
    }

    static listEntityToDomain(entities: GroupMessageEntity[]): GroupMessage[] {
        return entities.map((entity) => this.entityToDomain(entity));
    }
}
