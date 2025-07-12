import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';
import neo4j from 'neo4j-driver';
import { neo4jDriver } from '../neo4j/neo4j.provider';
import { EventRegistrationEntity } from '../core/entities/event-registration.entity';

@EventSubscriber()
export class EventRegisterEntitySubscriber implements EntitySubscriberInterface<EventRegistrationEntity> {
    listenTo() {
        return EventRegistrationEntity;
    }

    async afterInsert(userTag: InsertEvent<EventRegistrationEntity>) {
        const { userId, eventId } = userTag.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MERGE (u:UserEntity {id: $userId})
        WITH u
        MATCH (n:EventEntity {id: $eventId})
        MERGE (u)-[:REGISTERED]->(n)
        `,
                {
                    userId: neo4j.int(userId),
                    eventId: neo4j.int(eventId),
                }
            );
        } finally {
            await session.close();
        }
    }

    async afterRemove(userTag: RemoveEvent<EventRegistrationEntity>) {
        if (!userTag.entity) {
            return;
        }
        const { userId, eventId } = userTag.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MATCH (u:UserEntity {id: $userId})-[r:REGISTERED]->(n:EventEntity {id: $eventId})
        DELETE r
        `,
                {
                    userId: neo4j.int(userId),
                    eventId: neo4j.int(eventId),
                }
            );
        } finally {
            await session.close();
        }
    }
}
