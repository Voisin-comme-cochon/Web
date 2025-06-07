import { UserTag } from './user-tag.model';
import { Tag } from './tags.model';

export abstract class UserTagsRepository {
    abstract assignTagToUser(userId: number, tagId: number): Promise<UserTag>;

    abstract removeTagFromUser(userId: number, tagId: number): Promise<void>;

    abstract getUserTags(userId: number): Promise<Tag[]>;

    abstract getUserTagAssociation(userId: number, tagId: number): Promise<UserTag | null>;

    abstract getUsersByTag(tagId: number): Promise<UserTag[]>;
}