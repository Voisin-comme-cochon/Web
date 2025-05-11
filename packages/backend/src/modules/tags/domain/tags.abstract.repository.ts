import { TagEntity } from '../../../core/entities/tag.entity';

export abstract class TagsRepository {
    abstract getTags(limit: number, offset: number): Promise<[TagEntity[], number]>;

    abstract getTagById(id: number): Promise<TagEntity | null>;
}
