import { Geography } from 'typeorm';
import { ObjectStorageService } from 'src/modules/objectStorage/services/objectStorage.service';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { CreateNeighborhoodInput, GetNeighborhoodQueryParams, Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodImagesEntity } from '../../../core/entities/neighborhood-images.entity';
import { ResponseNeighborhoodDto } from '../controllers/dto/neighborhood.dto';
import { CochonError } from '../../../utils/CochonError';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';

export class NeighborhoodService {
    constructor(
        private neighborhoodRepository: NeighborhoodRepository,
        private readonly objectStorageService: ObjectStorageService
    ) {}

    async getAllNeighborhoods(
        params: GetNeighborhoodQueryParams,
        page: number,
        limit: number
    ): Promise<[Neighborhood[], number]> {
        return this.neighborhoodRepository.getAllNeighborhoods(params, page, limit);
    }
    async getNeighborhoodById(id: number): Promise<Neighborhood | null> {
        return this.neighborhoodRepository.getNeighborhoodById(id);
    }

    async createNeighborhood(input: CreateNeighborhoodInput): Promise<ResponseNeighborhoodDto> {
        const { name, description, geo, files } = input;

        let parsedGeo: Geography;
        try {
            parsedGeo = JSON.parse(geo) as Geography;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new CochonError('invalid_geo', 'Invalid geo format', 400);
            }

            throw new CochonError('geo_parsing_error', 'Error parsing geo', 500);
        }

        const imageEntities: NeighborhoodImagesEntity[] = [];
        for (let i = 0; i < files.length; i++) {
            const url = await this.objectStorageService.uploadFile(
                files[i].buffer,
                files[i].originalname,
                BucketType.NEIGHBORHOOD_IMAGES
            );
            imageEntities.push({
                url,
                isPrimary: i === 0,
            } as NeighborhoodImagesEntity);
        }

        const neighborhood = new NeighborhoodEntity();
        neighborhood.name = name;
        neighborhood.description = description;
        neighborhood.geo = parsedGeo;
        neighborhood.images = imageEntities;
        neighborhood.creationDate = new Date();

        return this.neighborhoodRepository.createNeighborhood(neighborhood);
    }
}
