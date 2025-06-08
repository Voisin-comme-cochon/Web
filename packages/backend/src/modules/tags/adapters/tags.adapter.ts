import { Tag, UpsertTag } from '../domain/tags.model';
import { TagDto, UpsertTagDto } from '../controllers/dto/tags.dto';
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

    static domainToEntity(tag: Tag): Partial<TagEntity> {
        return {
            id: tag.id,
            name: tag.name,
            color: tag.color,
        };
    }

    static createTagDtoToDomain(createTagDto: UpsertTagDto): UpsertTag {
        return {
            name: createTagDto.name,
            color: createTagDto.color,
        };
    }

    static domainToResponseTag(tag: Tag): TagDto {
        return {
            id: tag.id,
            name: tag.name,
            color: tag.color,
        };
    }

    static listDomainToResponseTag(tags: Tag[]): TagDto[] {
        return tags.map((tag) => this.domainToResponseTag(tag));
    }
}
