import { Group } from '../domain/groups.model';
import { ResponseGroupDto } from '../controllers/dto/groups.dto';
import { GroupEntity } from '../../../core/entities/group.entity';
import { Tag } from '../../tags/domain/tags.model';

export class GroupsAdapter {
    static entityToDomain(groupEntity: GroupEntity): Group {
        return {
            id: groupEntity.id,
            name: groupEntity.name,
            tagId: groupEntity.tagId,
            isPrivate: groupEntity.isPrivate,
            description: groupEntity.description,
        };
    }

    static listEntityToDomain(groupEntities: GroupEntity[]): Group[] {
        return groupEntities.map((groupEntity) => this.entityToDomain(groupEntity));
    }

    static domainToEntity(group: Group): GroupEntity {
        return {
            id: group.id,
            name: group.name,
            tagId: group.tagId,
            isPrivate: group.isPrivate,
            description: group.description,
        };
    }

    static domainToResponseGroup(group: Group, tag: Tag): ResponseGroupDto {
        return {
            id: group.id,
            name: group.name,
            tag: tag,
            isPrivate: group.isPrivate,
            description: group.description,
        };
    }

    static listDomainToResponseGroup(groups: Group[], tags: Tag[]): ResponseGroupDto[] {
        return groups.map((group, index) => this.domainToResponseGroup(group, tags[index]));
    }
}
