import { Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { neo4jDriver } from './neo4j.provider';

@Module({
    providers: [{ provide: 'NEO4J_DRIVER', useValue: neo4jDriver }, Neo4jService],
    exports: [Neo4jService],
})
export class Neo4jModule {}
