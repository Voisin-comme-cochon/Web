import { DataSource, Repository } from 'typeorm';
import {
    GroupMembershipEntity,
    MembershipStatus as EntityMembershipStatus,
} from '../../../core/entities/group-membership.entity';
import { GroupMembershipRepository } from '../domain/group-membership.abstract.repository';
import { GroupMembership, MembershipStatus } from '../domain/group-membership.model';
import { GroupMembershipAdapter } from '../adapters/group-membership.adapter';
import { CochonError } from '../../../utils/CochonError';

export class GroupMembershipRepositoryImplementation extends GroupMembershipRepository {
    private repository: Repository<GroupMembershipEntity>;

    constructor(private dataSource: DataSource) {
        super();
        this.repository = this.dataSource.getRepository(GroupMembershipEntity);
    }

    async findById(id: number): Promise<GroupMembership | null> {
        const entity = await this.repository.findOne({
            where: { id },
            relations: ['user'],
        });

        return entity ? GroupMembershipAdapter.entityToDomain(entity) : null;
    }

    async findByUserAndGroup(userId: number, groupId: number): Promise<GroupMembership | null> {
        const entity = await this.repository.findOne({
            where: { userId, groupId },
            relations: ['user'],
        });

        return entity ? GroupMembershipAdapter.entityToDomain(entity) : null;
    }

    async findByGroupId(groupId: number): Promise<GroupMembership[]> {
        const entities = await this.repository.find({
            where: { groupId },
            relations: ['user'],
        });

        return GroupMembershipAdapter.listEntityToDomain(entities);
    }

    async findByUserId(userId: number): Promise<GroupMembership[]> {
        const entities = await this.repository.find({
            where: { userId },
            relations: ['user'],
        });

        return GroupMembershipAdapter.listEntityToDomain(entities);
    }

    async findActiveByGroupId(groupId: number): Promise<GroupMembership[]> {
        const entities = await this.repository.find({
            where: {
                groupId,
                status: EntityMembershipStatus.ACTIVE,
            },
            relations: ['user'],
        });

        return GroupMembershipAdapter.listEntityToDomain(entities);
    }

    async create(membership: Omit<GroupMembership, 'id' | 'user'>): Promise<GroupMembership> {
        const entity = this.repository.create({
            userId: membership.userId,
            groupId: membership.groupId,
            status: membership.status as EntityMembershipStatus,
            isOwner: membership.isOwner,
        });

        const savedEntity = await this.repository.save(entity);

        const entityWithUser = await this.repository.findOne({
            where: { id: savedEntity.id },
            relations: ['user'],
        });

        if (!entityWithUser) {
            throw new CochonError('membership_creation_failed', 'Failed to create membership', 500);
        }
        return GroupMembershipAdapter.entityToDomain(entityWithUser);
    }

    async createMany(memberships: Omit<GroupMembership, 'id' | 'user'>[]): Promise<GroupMembership[]> {
        const entities = memberships.map((membership) =>
            this.repository.create({
                userId: membership.userId,
                groupId: membership.groupId,
                status: membership.status as EntityMembershipStatus,
                isOwner: membership.isOwner,
            })
        );

        const savedEntities = await this.repository.save(entities);

        const entitiesWithUser = await this.repository.find({
            where: savedEntities.map((e) => ({ id: e.id })),
            relations: ['user'],
        });

        return GroupMembershipAdapter.listEntityToDomain(entitiesWithUser);
    }

    async updateStatus(id: number, status: MembershipStatus): Promise<GroupMembership> {
        await this.repository.update(id, { status: status as EntityMembershipStatus });

        const updatedEntity = await this.repository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!updatedEntity) {
            throw new CochonError('membership_not_found', 'Membership not found', 404);
        }
        return GroupMembershipAdapter.entityToDomain(updatedEntity);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async countActiveByGroupId(groupId: number): Promise<number> {
        return await this.repository.count({
            where: {
                groupId,
                status: EntityMembershipStatus.ACTIVE,
            },
        });
    }
}
