import { DataSource } from 'typeorm';
import { UserTagsRepository } from '../domain/user-tags.abstract.repository';
import { UserTag } from '../domain/user-tag.model';
import { Tag } from '../domain/tags.model';
import { UserTagEntity } from '../../../core/entities/user-tag.entity';
import { TagsAdapter } from '../adapters/tags.adapter';

export class UserTagsRepositoryImplementation implements UserTagsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public async assignTagToUser(userId: number, tagId: number): Promise<UserTag> {
        const repository = this.dataSource.getRepository(UserTagEntity);
        const userTag = repository.create({
            userId,
            tagId,
            assignedAt: new Date(),
        });

        const savedUserTag = await repository.save(userTag);
        return {
            id: savedUserTag.id,
            userId: savedUserTag.userId,
            tagId: savedUserTag.tagId,
            assignedAt: savedUserTag.assignedAt,
        };
    }

    public async removeTagFromUser(userId: number, tagId: number): Promise<void> {
        const repository = this.dataSource.getRepository(UserTagEntity);
        const association = await this.getUserTagAssociation(userId, tagId);
        if (association) {
            await repository.delete(association.id);
        }
    }

    public async getUserTags(userId: number): Promise<Tag[]> {
        const repository = this.dataSource.getRepository(UserTagEntity);
        const userTags = await repository.find({
            where: { userId },
            relations: ['tag'],
        });

        return userTags.map((userTag) => TagsAdapter.entityToDomain(userTag.tag));
    }

    public async getUserTagAssociation(userId: number, tagId: number): Promise<UserTag | null> {
        const repository = this.dataSource.getRepository(UserTagEntity);
        const entity = await repository.findOne({
            where: { userId, tagId },
        });

        if (!entity) {
            return null;
        }

        return {
            id: entity.id,
            userId: entity.userId,
            tagId: entity.tagId,
            assignedAt: entity.assignedAt,
        };
    }

    public async getUsersByTag(tagId: number): Promise<UserTag[]> {
        const repository = this.dataSource.getRepository(UserTagEntity);
        const userTags = await repository.find({
            where: { tagId },
            relations: ['user'],
        });

        return userTags.map((userTag) => ({
            id: userTag.id,
            userId: userTag.userId,
            tagId: userTag.tagId,
            assignedAt: userTag.assignedAt,
        }));
    }
}