import { Tag } from '../domain/tags.model';
import { ResponseTagDto } from '../controllers/dto/tags.dto';
import { TagEntity } from '../../../core/entities/tag.entity';

export class TagsAdapter {
    static entityToDomain(tagEntity: TagEntity): Tag {
        return {
            id: tagEntity.id,
            name: tagEntity.name,
            color: tagEntity.color,
        };
    }

    static listEntityToDomain(tagEntities: TagEntity[]): Tag[] {
        return tagEntities.map((tagEntity) => this.entityToDomain(tagEntity));
    }

    static domainToEntity(tag: Tag): TagEntity {
        return {
            id: tag.id,
            name: tag.name,
            color: tag.color,
        };
    }

    static domainToResponseTag(tag: Tag): ResponseTagDto {
        return {
            id: tag.id,
            name: tag.name,
            color: tag.color,
        };
    }

    static listDomainToResponseTag(tags: Tag[]): ResponseTagDto[] {
        return tags.map((tag) => this.domainToResponseTag(tag));
    }
}
