import { DataSource, Repository } from 'typeorm';
import { GroupTypeEntity } from '../../../core/entities/group.entity';
import { GroupEntity } from '../../../core/entities/group.entity';
import { GroupRepository } from '../domain/group.abstract.repository';
import { Group, GroupType, CreateGroup, UpdateGroup } from '../domain/group.model';
import { GroupAdapter } from '../adapters/group.adapter';
import { CochonError } from '../../../utils/CochonError';

export class GroupRepositoryImplementation extends GroupRepository {
    private readonly groupEntityRepository: Repository<GroupEntity>;

    constructor(private readonly dataSource: DataSource) {
        super();
        this.groupEntityRepository = this.dataSource.getRepository(GroupEntity);
    }

    async findById(id: number): Promise<Group | null> {
        const entity = await this.groupEntityRepository.findOne({
            where: { id },
            relations: ['messages', 'messages.user'],
            order: { messages: { createdAt: 'DESC' } },
        });

        return entity ? GroupAdapter.entityToDomain(entity) : null;
    }

    async findByIdsWithMemberCount(ids: number[]): Promise<Group[]> {
        if (ids.length === 0) {
            return [];
        }

        const queryBuilder = this.groupEntityRepository
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.messages', 'lastMessage')
            .leftJoinAndSelect('lastMessage.user', 'messageUser')
            .loadRelationCountAndMap('group.memberCount', 'group.memberships', 'membershipCount', (qb) =>
                qb.where('membershipCount.status = :status', { status: 'active' })
            )
            .where('group.id IN (:...ids)', { ids })
            .orderBy('group.createdAt', 'DESC');

        const entities = await queryBuilder.getMany();
        return entities.map((entity) => GroupAdapter.entityToDomain(entity));
    }

    async findByNeighborhoodId(neighborhoodId: number): Promise<Group[]> {
        const entities = await this.groupEntityRepository.find({
            where: { neighborhoodId },
            relations: ['messages', 'messages.user'],
            order: { createdAt: 'DESC' },
        });

        return GroupAdapter.listEntityToDomain(entities);
    }

    async findUserGroupsInNeighborhood(
        userId: number,
        neighborhoodId: number,
        page: number,
        limit: number
    ): Promise<[Group[], number]> {
        const queryBuilder = this.groupEntityRepository
            .createQueryBuilder('group')
            .leftJoinAndSelect(
                'group.memberships',
                'membership',
                'membership.userId = :userId AND membership.status = :status',
                { userId, status: 'active' }
            )
            .leftJoinAndSelect('group.messages', 'lastMessage')
            .leftJoinAndSelect('lastMessage.user', 'messageUser')
            .loadRelationCountAndMap('group.memberCount', 'group.memberships', 'membershipCount', (qb) =>
                qb.where('membershipCount.status = :status', { status: 'active' })
            )
            .where('group.neighborhoodId = :neighborhoodId', { neighborhoodId })
            .andWhere('(group.type = :publicType OR membership.id IS NOT NULL)', { publicType: GroupType.PUBLIC })
            .orderBy('lastMessage.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [entities, count] = await queryBuilder.getManyAndCount();

        return [GroupAdapter.listEntityToDomain(entities), count];
    }

    async findPrivateChatBetweenUsers(user1Id: number, user2Id: number, neighborhoodId: number): Promise<Group | null> {
        const entity = await this.groupEntityRepository
            .createQueryBuilder('group')
            .innerJoin('group.memberships', 'membership1', 'membership1.userId = :user1Id', { user1Id })
            .innerJoin('group.memberships', 'membership2', 'membership2.userId = :user2Id', { user2Id })
            .where('group.type = :type', { type: GroupType.PRIVATE_CHAT })
            .andWhere('group.neighborhoodId = :neighborhoodId', { neighborhoodId })
            .getOne();

        return entity ? GroupAdapter.entityToDomain(entity) : null;
    }

    async create(group: CreateGroup): Promise<Group> {
        const entityData = {
            ...group,
            type: group.type as unknown as GroupTypeEntity,
        };
        const entity = this.groupEntityRepository.create(entityData);
        const savedEntity = await this.groupEntityRepository.save(entity);
        return GroupAdapter.entityToDomain(savedEntity);
    }

    async update(id: number, group: UpdateGroup): Promise<Group> {
        const updateData = {
            ...group,
            type: group.type ? (group.type as unknown as GroupTypeEntity) : undefined,
        };
        await this.groupEntityRepository.update(id, updateData);
        const updatedEntity = await this.groupEntityRepository.findOne({ where: { id } });
        if (!updatedEntity) {
            throw new CochonError('group_not_found', 'Group not found after update', 404);
        }
        return GroupAdapter.entityToDomain(updatedEntity);
    }

    async delete(id: number): Promise<void> {
        await this.groupEntityRepository.delete(id);
    }

    async findAvailableGroupsInNeighborhood(neighborhoodId: number, userId: number): Promise<Group[]> {
        const queryBuilder = this.groupEntityRepository
            .createQueryBuilder('group')
            .leftJoin(
                'group.memberships',
                'userMembership',
                'userMembership.userId = :userId AND userMembership.status = :activeStatus',
                {
                    userId,
                    activeStatus: 'active',
                }
            )
            .leftJoinAndSelect('group.messages', 'lastMessage')
            .leftJoinAndSelect('lastMessage.user', 'messageUser')
            .loadRelationCountAndMap('group.memberCount', 'group.memberships', 'membershipCount', (qb) =>
                qb.where('membershipCount.status = :status', { status: 'active' })
            )
            .where('group.neighborhoodId = :neighborhoodId', { neighborhoodId })
            .andWhere('group.type = :publicType', { publicType: GroupType.PUBLIC })
            .andWhere('group.isPrivate = false')
            .andWhere('userMembership.id IS NULL')
            .orderBy('group.createdAt', 'DESC');

        const entities = await queryBuilder.getMany();
        return GroupAdapter.listEntityToDomain(entities);
    }
}
