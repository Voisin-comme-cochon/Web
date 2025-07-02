import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { neo4jDriver } from './neo4j.provider';

@Injectable()
export class Neo4jService implements OnModuleDestroy {
    private session = neo4jDriver.session();

    async run(cypher: string, params: Record<string, any> = {}) {
        try {
            const result = await this.session.run(cypher, params);
            return result;
        } catch (err) {
            // Gestion d'erreur et logs
            console.error('Neo4j query error:', err);
            throw err;
        }
    }

    async onModuleDestroy() {
        await this.session.close();
        await neo4jDriver.close();
    }
}
