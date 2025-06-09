import { Tag, UpsertTag } from '../domain/tags.model';
import { TagsAdapter } from '../adapters/tags.adapter';
import { TagsRepository } from '../domain/tags.abstract.repository';
import { CochonError } from '../../../utils/CochonError';
import { UpsertTagDto } from '../controllers/dto/tags.dto';
import { isNull } from '../../../utils/tools';
import { UsersRepository } from '../../users/domain/users.abstract.repository';

export class TagsService {
    constructor(
        private tagsRepository: TagsRepository,
        private usersRepository: UsersRepository
    ) {}

    public async getTags(page: number, limit: number): Promise<[Tag[], number]> {
        const offset = page * limit - limit;
        return this.tagsRepository.getTags(limit, offset);
    }

    public async getTagById(id: number): Promise<Tag> {
        const tag = await this.tagsRepository.getTagById(id);
        if (isNull(tag)) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }
        return tag;
    }

    public async createTag(createTagDto: UpsertTagDto): Promise<Tag> {
        const tagData = TagsAdapter.createTagDtoToDomain(createTagDto);
        return this.tagsRepository.createTag(tagData);
    }

    public async updateTag(id: number, updateTagDto: UpsertTagDto): Promise<Tag> {
        const existingTag = await this.tagsRepository.getTagById(id);
        if (isNull(existingTag)) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }

        const upsertData: UpsertTag = updateTagDto;
        const updatedTag = await this.tagsRepository.updateTag(id, upsertData);
        if (isNull(updatedTag)) {
            throw new CochonError('tag-update-failed', 'Failed to update tag');
        }

        return updatedTag;
    }

    public async deleteTag(id: number): Promise<void> {
        const existingTag = await this.tagsRepository.getTagById(id);
        if (isNull(existingTag)) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }

        const deleted = await this.tagsRepository.deleteTag(id);
        if (isNull(deleted)) {
            throw new CochonError('tag-delete-failed', 'Failed to delete tag');
        }
    }

    public async updateUserTags(userId: number, tagIds: number[]): Promise<void> {
        const user = await this.usersRepository.getUserById(userId);
        if (isNull(user)) {
            throw new CochonError('user-not-found', 'User not found');
        }

        for (const tagId of tagIds) {
            const tag = await this.tagsRepository.getTagById(tagId);
            if (isNull(tag)) {
                throw new CochonError('tag-not-found', `Tag with id ${tagId} not found`);
            }
        }

        await this.tagsRepository.assignTagsToUser(userId, tagIds);
    }
}
