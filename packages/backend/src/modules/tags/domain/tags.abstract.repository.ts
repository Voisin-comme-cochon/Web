import { Tag, UpsertTag } from './tags.model';

export abstract class TagsRepository {
    abstract getTags(limit: number, offset: number): Promise<[Tag[], number]>;

    abstract getTagById(id: number): Promise<Tag | null>;

    abstract createTag(tag: UpsertTag): Promise<Tag>;

    abstract updateTag(id: number, tag: UpsertTag): Promise<Tag | null>;

    abstract deleteTag(id: number): Promise<boolean>;
}
