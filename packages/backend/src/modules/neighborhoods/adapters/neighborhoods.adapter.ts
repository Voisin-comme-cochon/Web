import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { Neighborhood } from '../domain/neighborhood.model';
import { GetNeighborhoodQueryParamsDto, ResponseNeighborhoodDto } from '../controllers/dto/neighborhood.dto';
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

    public static queryParamsDtoToDomain(params: GetNeighborhoodQueryParamsDto): GetNeighborhoodQueryParamsDto {
        return {
            status: params.status,
        };
    }

    public static domainToDto(neighborhood: Neighborhood): ResponseNeighborhoodDto {
        return {
            id: neighborhood.id,
            name: neighborhood.name,
            geo: neighborhood.geo,
            description: neighborhood.description,
            creationDate: neighborhood.creationDate,
            images: neighborhood.images,
        };
    }

    public static listDomainToDto(neighborhoods: Neighborhood[]): ResponseNeighborhoodDto[] {
        return neighborhoods.map((neighborhood) => this.domainToDto(neighborhood));
    }
}
