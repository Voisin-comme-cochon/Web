import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import neo4j from 'neo4j-driver';
import { NeighborhoodUserEntity } from '../core/entities/neighborhood-user.entity';
import { neo4jDriver } from '../neo4j/neo4j.provider';

@EventSubscriber()
export class NeighborhoodUserEntitySubscriber implements EntitySubscriberInterface<NeighborhoodUserEntity> {
    listenTo() {
        return NeighborhoodUserEntity;
    }

    async afterInsert(event: InsertEvent<NeighborhoodUserEntity>) {
        const { userId, neighborhoodId, status } = event.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
                MERGE (u:UserEntity {id: $userId})
                WITH u
                MATCH (n:Neighborhood {id: $neighborhoodId})
                MERGE (u)-[r:MEMBER_OF]->(n)
                SET r.status = $status
                `,
                {
                    userId: neo4j.int(userId),
                    neighborhoodId: neo4j.int(neighborhoodId),
                    status,
                }
            );
        } finally {
            await session.close();
        }
    }

    async afterRemove(event: RemoveEvent<NeighborhoodUserEntity>) {
        if (!event.entity) {
            return;
        }
        const { userId, neighborhoodId } = event.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
                MATCH (u:UserEntity {id: $userId})-[r:MEMBER_OF]->(n:Neighborhood {id: $neighborhoodId})
                DELETE r
                `,
                {
                    userId: neo4j.int(userId),
                    neighborhoodId: neo4j.int(neighborhoodId),
                }
            );
        } finally {
            await session.close();
        }
    }

    async afterUpdate(event: UpdateEvent<NeighborhoodUserEntity>) {
        if (!event.entity) return;
        const { userId, neighborhoodId, status } = event.entity as NeighborhoodUserEntity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
                MATCH (u:UserEntity {id: $userId})-[r:MEMBER_OF]->(n:Neighborhood {id: $neighborhoodId})
                SET r.status = $status
                `,
                {
                    userId: neo4j.int(userId),
                    neighborhoodId: neo4j.int(neighborhoodId),
                    status,
                }
            );
        } finally {
            await session.close();
        }
    }
}
