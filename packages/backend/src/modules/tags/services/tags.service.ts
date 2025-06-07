import { Tag, UpsertTag } from '../domain/tags.model';
import { TagsAdapter } from '../adapters/tags.adapter';
import { TagsRepository } from '../domain/tags.abstract.repository';
import { NeighborhoodRepository } from '../../neighborhoods/domain/neighborhood.abstract.repository';
import { CochonError } from '../../../utils/CochonError';
import { UpsertTagDto } from '../controllers/dto/tags.dto';

export class TagsService {
    constructor(
        private eventRepository: TagsRepository,
        private neighborhoodRepository: NeighborhoodRepository
    ) {}

    public async getTags(page: number, limit: number): Promise<[Tag[], number]> {
        const offset = page * limit - limit;
        return this.eventRepository.getTags(limit, offset);
    }

    public async getTagById(id: number): Promise<Tag> {
        const tag = await this.eventRepository.getTagById(id);
        if (!tag) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }
        return tag;
    }

    public async getTagsByNeighborhoodId(neighborhoodId: number): Promise<Tag[]> {
        return this.eventRepository.getTagsByNeighborhoodId(neighborhoodId);
    }

    public async createTag(createTagDto: UpsertTagDto): Promise<Tag> {
        if (createTagDto.neighborhoodId) {
            const neighborhood = await this.neighborhoodRepository.getNeighborhoodById(createTagDto.neighborhoodId);
            if (!neighborhood) {
                throw new CochonError('neighborhood-not-found', 'Neighborhood not found', 404);
            }
        }

        const tagData = TagsAdapter.createTagDtoToDomain(createTagDto);
        return this.eventRepository.createTag(tagData);
    }

    public async updateTag(id: number, updateTagDto: UpsertTagDto): Promise<Tag> {
        const existingTag = await this.eventRepository.getTagById(id);
        if (!existingTag) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }

        if (updateTagDto.neighborhoodId && updateTagDto.neighborhoodId !== existingTag.neighborhoodId) {
            const neighborhood = await this.neighborhoodRepository.getNeighborhoodById(updateTagDto.neighborhoodId);
            if (!neighborhood) {
                throw new CochonError('neighborhood-not-found', 'Neighborhood not found', 404);
            }
        }

        const upsertData: UpsertTag = updateTagDto;
        const updatedTag = await this.eventRepository.updateTag(id, upsertData);
        if (!updatedTag) {
            throw new CochonError('tag-update-failed', 'Failed to update tag');
        }

        return updatedTag;
    }

    public async deleteTag(id: number): Promise<void> {
        const existingTag = await this.eventRepository.getTagById(id);
        if (!existingTag) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }

        const deleted = await this.eventRepository.deleteTag(id);
        if (!deleted) {
            throw new CochonError('tag-delete-failed', 'Failed to delete tag');
        }
    }
}
