import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';
import neo4j from 'neo4j-driver';
import { neo4jDriver } from '../neo4j/neo4j.provider';
import { UserTagEntity } from '../core/entities/user-tag.entity';

@EventSubscriber()
export class UserTagsEntitySubscriber implements EntitySubscriberInterface<UserTagEntity> {
    listenTo() {
        return UserTagEntity;
    }

    async afterInsert(userTag: InsertEvent<UserTagEntity>) {
        const { userId, tagId } = userTag.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MERGE (u:UserEntity {id: $userId})
        WITH u
        MATCH (n:TagEntity {id: $tagId})
        MERGE (u)-[:LIKE]->(n)
        `,
                {
                    userId: neo4j.int(userId),
                    tagId: neo4j.int(tagId),
                }
            );
        } finally {
            await session.close();
        }
    }

    async afterRemove(userTag: RemoveEvent<UserTagEntity>) {
        if (!userTag.entity) {
            return;
        }
        const { userId, tagId } = userTag.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MATCH (u:UserEntity {id: $userId})-[r:LIKE]->(n:TagEntity {id: $tagId})
        DELETE r
        `,
                {
                    userId: neo4j.int(userId),
                    tagId: neo4j.int(tagId),
                }
            );
        } finally {
            await session.close();
        }
    }
}
