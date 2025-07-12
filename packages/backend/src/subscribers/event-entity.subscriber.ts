import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { neo4jDriver } from '../neo4j/neo4j.provider';
import { EventEntity } from '../core/entities/event.entity';

@EventSubscriber()
export class EventEntitySubscriber implements EntitySubscriberInterface<EventEntity> {
    listenTo() {
        return EventEntity;
    }

    async afterInsert(event: InsertEvent<EventEntity>) {
        const session = neo4jDriver.session();
        const { id, name } = event.entity;
        try {
            await session.run(
                `MERGE (n:EventEntity {id: $id})
                SET n.name = $name`,
                { id, name }
            );
        } finally {
            await session.close();
        }
    }

    async afterUpdate(event: UpdateEvent<EventEntity>) {
        const session = neo4jDriver.session();
        const { id, name } = event.entity as EventEntity;
        try {
            await session.run(
                `MATCH (n:EventEntity {id: $id})
                SET n.name = $name`,
                { id, name }
            );
        } finally {
            await session.close();
        }
    }

    async afterRemove(event: RemoveEvent<EventEntity>) {
        const session = neo4jDriver.session();
        if (!event.entity) {
            return;
        }
        const { id } = event.entity;
        try {
            await session.run(`MATCH (n:EventEntity {id: $id}) DETACH DELETE n`, { id });
        } finally {
            await session.close();
        }
    }
}
