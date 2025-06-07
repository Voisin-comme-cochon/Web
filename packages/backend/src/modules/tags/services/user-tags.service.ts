import { UserTag } from '../domain/user-tag.model';
import { Tag } from '../domain/tags.model';
import { UsersRepository } from '../../users/domain/users.abstract.repository';
import { TagsRepository } from '../domain/tags.abstract.repository';
import { UserTagsRepository } from '../domain/user-tags.abstract.repository';
import { CochonError } from '../../../utils/CochonError';

export class UserTagsService {
    constructor(
        private userRepository: UsersRepository,
        private tagRepository: TagsRepository,
        private userTagsRepository: UserTagsRepository
    ) {}

    public async assignTagsToUser(userId: number, tagIds: number[]): Promise<UserTag[]> {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new CochonError('user-not-found', 'User not found', 404);
        }

        const userNeighborhoods = await this.userRepository.getUserNeighborhoods(userId);
        const userNeighborhoodIds = userNeighborhoods.map((n) => n.id);

        const results: UserTag[] = [];

        for (const tagId of tagIds) {
            const tag = await this.tagRepository.getTagById(tagId);
            if (!tag) {
                throw new CochonError('tag-not-found', `Tag with id ${tagId} not found`, 404);
            }

            if (!userNeighborhoodIds.includes(tag.neighborhoodId)) {
                throw new CochonError(
                    'user-tag-neighborhood-mismatch',
                    `User must belong to the same neighborhood as tag ${tagId}`,
                    400
                );
            }

            const existingAssociation = await this.userTagsRepository.getUserTagAssociation(userId, tagId);
            if (existingAssociation) {
                throw new CochonError('user-tag-already-exists', `User is already associated with tag ${tagId}`, 409);
            }

            const userTag = await this.userTagsRepository.assignTagToUser(userId, tagId);
            results.push(userTag);
        }

        return results;
    }

    public async removeTagsFromUser(userId: number, tagIds: number[]): Promise<void> {
        for (const tagId of tagIds) {
            const association = await this.userTagsRepository.getUserTagAssociation(userId, tagId);
            if (!association) {
                throw new CochonError('user-tag-not-found', `User is not associated with tag ${tagId}`, 404);
            }
            await this.userTagsRepository.removeTagFromUser(userId, tagId);
        }
    }

    public async getUserTags(userId: number): Promise<Tag[]> {
        return this.userTagsRepository.getUserTags(userId);
    }
}
