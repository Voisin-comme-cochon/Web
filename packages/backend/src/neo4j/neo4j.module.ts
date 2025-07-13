import { Global, Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { neo4jDriver } from './neo4j.provider';

@Global()
@Module({
    providers: [
        {
            provide: 'NEO4J_DRIVER',
            useValue: neo4jDriver,
        },
        Neo4jService,
    ],
    exports: [Neo4jService, 'NEO4J_DRIVER'],
})
export class Neo4jModule {}
