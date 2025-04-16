import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { Neighborhood } from '../domain/neighborhood.model';

export class NeighborhoodsAdapter {
    public static databaseToDomain(neighborhood: NeighborhoodEntity): Neighborhood {
        return {
            id: neighborhood.id,
            name: neighborhood.name,
            geo: neighborhood.geo,
            status: neighborhood.status,
            description: neighborhood.description,
            creationDate: neighborhood.creationDate,
        };
    }

    public static listDatabaseToDomain(neighborhoods: NeighborhoodEntity[]): Neighborhood[] {
        return neighborhoods.map((neighborhood) => this.databaseToDomain(neighborhood));
    }
}
