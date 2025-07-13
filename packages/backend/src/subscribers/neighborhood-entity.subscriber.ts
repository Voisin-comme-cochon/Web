import {
    BeforeRemove,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import neo4j from 'neo4j-driver';
import { NeighborhoodEntity } from '../core/entities/neighborhood.entity';
import { neo4jDriver } from '../neo4j/neo4j.provider';

// ton NeighborhoodEntitySubscriber reste identique
@EventSubscriber()
export class NeighborhoodEntitySubscriber implements EntitySubscriberInterface<NeighborhoodEntity> {
    listenTo() {
        return NeighborhoodEntity;
    }

    async afterInsert(e: InsertEvent<NeighborhoodEntity>) {
        const { id, name } = e.entity;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MERGE (n:Neighborhood {id: $id})
        SET n.name = $name
        `,
                { id: neo4j.int(id), name }
            );
        } finally {
            await session.close();
        }
    }

    async afterUpdate(e: UpdateEvent<NeighborhoodEntity>) {
        const ent = e.entity as NeighborhoodEntity | undefined;
        if (!ent) return;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MATCH (n:Neighborhood {id: $id})
        SET n.name = $name
        `,
                { id: neo4j.int(ent.id), name: ent.name }
            );
        } finally {
            await session.close();
        }
    }

    @BeforeRemove()
    async beforeRemove(e: RemoveEvent<NeighborhoodEntity>) {
        const { id } = e.entity!;
        const session = neo4jDriver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            await session.run(
                `
        MATCH (n:Neighborhood {id: $id})
        DETACH DELETE n
        `,
                { id: neo4j.int(id) }
            );
        } finally {
            await session.close();
        }
    }
}
