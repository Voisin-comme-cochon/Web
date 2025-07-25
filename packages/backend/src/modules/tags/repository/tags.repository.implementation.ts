import { DataSource, In } from 'typeorm';
import { TagsRepository } from '../domain/tags.abstract.repository';
import { TagEntity } from '../../../core/entities/tag.entity';
import { Tag, UpsertTag } from '../domain/tags.model';
import { TagsAdapter } from '../adapters/tags.adapter';
import { UserEntity } from '../../../core/entities/user.entity';
import { UserTagEntity } from '../../../core/entities/user-tag.entity';
import { CochonError } from '../../../utils/CochonError';

export class TagsRepositoryImplementation implements TagsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public async getTags(limit: number, offset: number): Promise<[Tag[], number]> {
        const [entities, count] = await this.dataSource.getRepository(TagEntity).findAndCount({
            skip: offset,
            take: limit,
        });
        const tags = TagsAdapter.listEntityToDomain(entities);
        return [tags, count];
    }

    public async getTagById(id: number): Promise<Tag | null> {
        const entity = await this.dataSource.getRepository(TagEntity).findOne({
            where: { id: id },
        });
        return entity ? TagsAdapter.entityToDomain(entity) : null;
    }

    public async createTag(tag: UpsertTag): Promise<Tag> {
        const repository = this.dataSource.getRepository(TagEntity);
        const newTag = repository.create(tag);
        const savedEntity = await repository.save(newTag);
        return TagsAdapter.entityToDomain(savedEntity);
    }

    public async updateTag(id: number, tag: UpsertTag): Promise<Tag | null> {
        const repository = this.dataSource.getRepository(TagEntity);
        await repository.update(id, tag);
        return this.getTagById(id);
    }

    public async deleteTag(id: number): Promise<boolean> {
        const repository = this.dataSource.getRepository(TagEntity);
        const result = await repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    public async assignTagsToUser(userId: number, tagIds: number[]): Promise<void> {
        const userTagRepository = this.dataSource.getRepository(UserTagEntity);

        const userRepository = this.dataSource.getRepository(UserEntity);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new CochonError('user_not_found', 'User not found', 404);
        }

        const tags = await this.dataSource.getRepository(TagEntity).findBy({ id: In(tagIds) });
        if (tags.length !== tagIds.length) {
            throw new CochonError('one_or_more_tags_not_found', 'One or more tags not found', 404);
        }

        await userTagRepository.delete({ userId });

        const userTags = tagIds.map((tagId) => ({
            userId,
            tagId,
        }));

        await userTagRepository.save(userTags);
    }
}
