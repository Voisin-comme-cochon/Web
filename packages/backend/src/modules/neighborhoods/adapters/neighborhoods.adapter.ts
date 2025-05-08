import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodImagesAdapter } from './neighborhood-images.adapter';

export class NeighborhoodsAdapter {
    public static databaseToDomain(neighborhood: NeighborhoodEntity): Neighborhood {
        return {
            id: neighborhood.id,
            name: neighborhood.name,
            geo: neighborhood.geo,
            status: neighborhood.status,
            description: neighborhood.description,
            creationDate: neighborhood.creationDate,
            images: NeighborhoodImagesAdapter.listDatabaseToDomain(neighborhood.images),
        };
    }

    public static listDatabaseToDomain(neighborhoods: NeighborhoodEntity[]): Neighborhood[] {
        return neighborhoods.map((neighborhood) => this.databaseToDomain(neighborhood));
    }
}
