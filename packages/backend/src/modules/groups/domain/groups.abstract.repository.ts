import { GroupEntity } from '../../../core/entities/group.entity';

export abstract class GroupsRepository {
    abstract getGroups(limit: number, offset: number): Promise<[GroupEntity[], number]>;

    abstract getGroupById(id: number): Promise<GroupEntity | null>;

    abstract countMessageAmount(): Promise<number>;
}
