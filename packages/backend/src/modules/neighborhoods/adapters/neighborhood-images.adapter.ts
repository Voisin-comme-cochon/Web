import { NeighborhoodImagesEntity } from '../../../core/entities/neighborhood-images.entity';
import { NeighborhoodImage } from '../domain/neighborhood-image.model';

export class NeighborhoodImagesAdapter {
    public static databaseToDomain(image: NeighborhoodImagesEntity): NeighborhoodImage {
        return {
            id: image.id,
            url: image.url,
            isPrimary: image.isPrimary,
            neighborhoodId: image.neighborhoodId,
        };
    }

    public static listDatabaseToDomain(images: NeighborhoodImagesEntity[]): NeighborhoodImage[] {
        return images.map((image) => this.databaseToDomain(image));
    }
}
