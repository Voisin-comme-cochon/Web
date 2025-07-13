import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Driver, int, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleDestroy {
    constructor(@Inject('NEO4J_DRIVER') private readonly driver: Driver) {}

    async run(cypher: string, params: Record<string, any> = {}) {
        const session: Session = this.driver.session({ defaultAccessMode: 'WRITE' });
        try {
            return await session.run(cypher, params);
        } catch (err) {
            console.error('Neo4j query error:', err);
            throw err;
        } finally {
            await session.close();
        }
    }

    async onModuleDestroy() {
        await this.driver.close();
    }

    async getRecommendationsByUserAndNeighborhood(userId: number, neighborhoodId: number, limit = 10) {
        const session: Session = this.driver.session({ defaultAccessMode: 'READ' });
        const cypher = `
      MATCH (u:UserEntity {id: $userId})-[:MEMBER_OF {status:'accepted'}]->(n:Neighborhood {id: $neighborhoodId})
      MATCH (other:UserEntity)-[:MEMBER_OF {status:'accepted'}]->(n)
      WHERE other.id <> $userId
      OPTIONAL MATCH (u)-[]->(common)<-[]-(other)
      WITH other, count(DISTINCT common) AS sharedLinks
      RETURN other { .id, .name } AS user, sharedLinks
      ORDER BY sharedLinks DESC
      LIMIT $limit
    `;
        try {
            const result = await session.run(cypher, {
                userId: int(userId),
                neighborhoodId: int(neighborhoodId),
                limit: int(limit),
            });
            return result.records.map((r) => ({
                user: r.get('user'),
                sharedLinks: r.get('sharedLinks').toNumber(),
            }));
        } catch (err) {
            console.error('Recommendation query error:', err);
            throw err;
        } finally {
            await session.close();
        }
    }
}
