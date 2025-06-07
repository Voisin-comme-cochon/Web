import { Tag, UpsertTag } from '../domain/tags.model';
import { TagDto, UpsertTagDto } from '../controllers/dto/tags.dto';
import { TagEntity } from '../../../core/entities/tag.entity';

export class TagsAdapter {
    static entityToDomain(tagEntity: TagEntity): Tag {
        return {
            id: tagEntity.id,
            name: tagEntity.name,
            color: tagEntity.color,
            neighborhoodId: tagEntity.neighborhoodId,
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
            neighborhoodId: tag.neighborhoodId,
        };
    }

    static createTagDtoToDomain(createTagDto: UpsertTagDto): UpsertTag {
        return {
            name: createTagDto.name,
            color: createTagDto.color,
            neighborhoodId: createTagDto.neighborhoodId,
        };
    }

    static domainToResponseTag(tag: Tag): TagDto {
        return {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            neighborhoodId: tag.neighborhoodId,
        };
    }

    static listDomainToResponseTag(tags: Tag[]): TagDto[] {
        return tags.map((tag) => this.domainToResponseTag(tag));
    }
}
