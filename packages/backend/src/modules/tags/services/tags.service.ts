import { Tag } from '../domain/tags.model';
import { TagsAdapter } from '../adapters/tags.adapter';
import { TagsRepository } from '../domain/tags.abstract.repository';
import { CochonError } from '../../../utils/CochonError';

export class TagsService {
    constructor(private eventRepository: TagsRepository) {}

    public async getTags(page: number, limit: number): Promise<[Tag[], number]> {
        const offset = page * limit - limit;
        const [tags, count] = await this.eventRepository.getTags(limit, offset);
        const domainTags = TagsAdapter.listEntityToDomain(tags);
        return [domainTags, count];
    }

    public async getTagById(id: number): Promise<Tag> {
        const tag = await this.eventRepository.getTagById(id);
        if (!tag) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }
        return TagsAdapter.entityToDomain(tag);
    }
}
