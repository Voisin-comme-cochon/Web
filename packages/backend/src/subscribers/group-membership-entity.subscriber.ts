import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';
import neo4j from 'neo4j-driver';
import { neo4jDriver } from '../neo4j/neo4j.provider';
import { GroupMembershipEntity } from '../core/entities/group-membership.entity';

@EventSubscriber()
export class GroupMembershipEntitySubscriber implements EntitySubscriberInterface<GroupMembershipEntity> {
    listenTo() {
        return GroupMembershipEntity;
    }

    async afterInsert(groupMember: InsertEvent<GroupMembershipEntity>) {
        const { userId, groupId } = groupMember.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MERGE (u:UserEntity {id: $userId})
        WITH u
        MATCH (n:GroupEntity {id: $groupId})
        MERGE (u)-[:REGISTERED]->(n)
        `,
                {
                    userId: neo4j.int(userId),
                    groupId: neo4j.int(groupId),
                }
            );
        } finally {
            await session.close();
        }
    }

    async afterRemove(groupMember: RemoveEvent<GroupMembershipEntity>) {
        if (!groupMember.entity) {
            return;
        }
        const { userId, groupId } = groupMember.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MATCH (u:UserEntity {id: $userId})-[r:REGISTERED]->(n:GroupEntity {id: $groupId})
        DELETE r
        `,
                {
                    userId: neo4j.int(userId),
                    groupId: neo4j.int(groupId),
                }
            );
        } finally {
            await session.close();
        }
    }
}
