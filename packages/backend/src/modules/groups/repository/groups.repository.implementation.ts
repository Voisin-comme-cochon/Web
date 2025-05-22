import { DataSource } from 'typeorm';
import { GroupsRepository } from '../domain/groups.abstract.repository';
import { GroupEntity } from '../../../core/entities/group.entity';
import { GroupMessageEntity } from '../../../core/entities/group-message.entity';

export class GroupsRepositoryImplementation implements GroupsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getGroups(limit: number, offset: number): Promise<[GroupEntity[], number]> {
        return this.dataSource.getRepository(GroupEntity).findAndCount({
            skip: offset,
            take: limit,
        });
    }

    public getGroupById(id: number): Promise<GroupEntity | null> {
        return this.dataSource.getRepository(GroupEntity).findOne({
            where: { id: id },
        });
    }

    public countMessageAmount(): Promise<number> {
        return this.dataSource.getRepository(GroupMessageEntity).count();
    }
}
