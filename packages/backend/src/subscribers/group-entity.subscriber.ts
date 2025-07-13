import {
    BeforeRemove,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { neo4jDriver } from '../neo4j/neo4j.provider';
import { GroupEntity } from '../core/entities/group.entity';

@EventSubscriber()
export class GroupEntitySubscriber implements EntitySubscriberInterface<GroupEntity> {
    listenTo() {
        return GroupEntity;
    }

    async afterInsert(group: InsertEvent<GroupEntity>) {
        const session = neo4jDriver.session();
        const { id, name } = group.entity;
        try {
            await session.run(
                `MERGE (n:GroupEntity {id: $id})
                SET n.name = $name`,
                { id, name }
            );
        } finally {
            await session.close();
        }
    }

    async afterUpdate(group: UpdateEvent<GroupEntity>) {
        const session = neo4jDriver.session();
        const { id, name } = group.entity as GroupEntity;
        try {
            await session.run(
                `MATCH (n:GroupEntity {id: $id})
                SET n.name = $name`,
                { id, name }
            );
        } finally {
            await session.close();
        }
    }

    @BeforeRemove()
    async beforeRemove(group: RemoveEvent<GroupEntity>) {
        const session = neo4jDriver.session();
        if (!group.entity) {
            return;
        }
        const { id } = group.entity;
        try {
            await session.run(`MATCH (n:GroupEntity {id: $id}) DETACH DELETE n`, { id });
        } finally {
            await session.close();
        }
    }
}
