import {
    BeforeRemove,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { neo4jDriver } from '../neo4j/neo4j.provider';
import { TagEntity } from '../core/entities/tag.entity';

@EventSubscriber()
export class TagEntitySubscriber implements EntitySubscriberInterface<TagEntity> {
    listenTo() {
        return TagEntity;
    }

    async afterInsert(tag: InsertEvent<TagEntity>) {
        const session = neo4jDriver.session();
        const { id, name } = tag.entity;
        try {
            await session.run(
                `MERGE (n:TagEntity {id: $id})
                SET n.name = $name`,
                { id, name }
            );
        } finally {
            await session.close();
        }
    }

    async afterUpdate(tag: UpdateEvent<TagEntity>) {
        const session = neo4jDriver.session();
        const { id, name } = tag.entity as TagEntity;
        try {
            await session.run(
                `MATCH (n:TagEntity {id: $id})
                SET n.name = $name`,
                { id, name }
            );
        } finally {
            await session.close();
        }
    }

    @BeforeRemove()
    async beforeRemove(tag: RemoveEvent<TagEntity>) {
        if (!tag.entity) {
            return;
        }
        const session = neo4jDriver.session();
        const { id } = tag.entity;
        try {
            await session.run(`MATCH (n:TagEntity {id: $id}) DETACH DELETE n`, { id });
        } finally {
            await session.close();
        }
    }
}
