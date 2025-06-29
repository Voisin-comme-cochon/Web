import { DataSource, Repository } from 'typeorm';
import { GroupMessageEntity } from '../../../core/entities/group-message.entity';
import { GroupMessageRepository } from '../domain/group-message.abstract.repository';
import { GroupMessage } from '../domain/group-message.model';
import { GroupMessageAdapter } from '../adapters/group-message.adapter';
import { CochonError } from '../../../utils/CochonError';

export class GroupMessageRepositoryImplementation extends GroupMessageRepository {
    private repository: Repository<GroupMessageEntity>;

    constructor(private dataSource: DataSource) {
        super();
        this.repository = this.dataSource.getRepository(GroupMessageEntity);
    }

    async findById(id: number): Promise<GroupMessage | null> {
        const entity = await this.repository.findOne({
            where: { id },
            relations: ['user'],
        });

        return entity ? GroupMessageAdapter.entityToDomain(entity) : null;
    }

    async findByGroupId(groupId: number, page: number, limit: number): Promise<[GroupMessage[], number]> {
        const queryBuilder = this.repository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.user', 'user')
            .where('message.groupId = :groupId', { groupId })
            .orderBy('message.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [entities, count] = await queryBuilder.getManyAndCount();

        return [GroupMessageAdapter.listEntityToDomain(entities), count];
    }

    async create(message: Omit<GroupMessage, 'id' | 'createdAt' | 'user'>): Promise<GroupMessage> {
        const entity = this.repository.create(message);
        const savedEntity = await this.repository.save(entity);

        const entityWithUser = await this.repository.findOne({
            where: { id: savedEntity.id },
            relations: ['user'],
        });

        if (!entityWithUser) {
            throw new CochonError('group_message_not_found', 'Group message not found after creation', 404);
        }
        return GroupMessageAdapter.entityToDomain(entityWithUser);
    }

    async getLastMessageByGroupId(groupId: number): Promise<GroupMessage | null> {
        const entity = await this.repository.findOne({
            where: { groupId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        return entity ? GroupMessageAdapter.entityToDomain(entity) : null;
    }

    async countByGroupId(groupId: number): Promise<number> {
        return await this.repository.count({ where: { groupId } });
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async getAmountOfMessage(): Promise<number> {
        return await this.repository.count();
    }
}
