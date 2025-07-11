import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { UserEntity } from '../core/entities/user.entity';
import { neo4jDriver } from '../neo4j/neo4j.provider';

@EventSubscriber()
export class UserEntitySubscriber implements EntitySubscriberInterface<UserEntity> {
    listenTo() {
        return UserEntity;
    }

    async afterInsert(user: InsertEvent<UserEntity>) {
        const session = neo4jDriver.session();
        const { id, firstName, lastName } = user.entity;
        try {
            await session.run(
                `MERGE (n:UserEntity {id: $id})
                SET n.firstName = $firstName,
                    n.lastName = $lastName`,
                { id, firstName, lastName }
            );
        } finally {
            await session.close();
        }
    }

    async afterUpdate(user: UpdateEvent<UserEntity>) {
        const session = neo4jDriver.session();
        const { id, firstName, lastName } = user.entity as UserEntity;
        try {
            await session.run(
                `MATCH (n:UserEntity {id: $id})
                SET n.firstName = $firstName,
                    n.lastName = $lastName`,
                { id, firstName, lastName }
            );
        } finally {
            await session.close();
        }
    }

    async afterRemove(user: RemoveEvent<UserEntity>) {
        const session = neo4jDriver.session();
        if (!user.entity) {
            return;
        }
        const { id } = user.entity;
        try {
            await session.run(`MATCH (n:UserEntity {id: $id}) DETACH DELETE n`, { id });
        } finally {
            await session.close();
        }
    }
}
