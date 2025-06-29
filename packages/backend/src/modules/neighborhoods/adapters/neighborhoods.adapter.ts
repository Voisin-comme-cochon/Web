import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { Neighborhood } from '../domain/neighborhood.model';
import { GetNeighborhoodQueryParamsDto, ResponseNeighborhoodDto } from '../controllers/dto/neighborhood.dto';
import { NeighborhoodUserRole, NeighborhoodUserStatus } from '../../../core/entities/neighborhood-user.entity';
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
            images: NeighborhoodImagesAdapter.listDatabaseToDomain(neighborhood.images ?? []),
            neighborhood_users: neighborhood.neighborhood_users?.map((user) => ({
                id: user.id,
                userId: user.userId,
                role: user.role as NeighborhoodUserRole,
                status: user.status as NeighborhoodUserStatus,
                neighborhoodId: user.neighborhoodId,
            })),
        };
    }

    public static listDatabaseToDomain(neighborhoods: NeighborhoodEntity[]): Neighborhood[] {
        return neighborhoods.map((neighborhood) => this.databaseToDomain(neighborhood));
    }

    public static queryParamsDtoToDomain(params: GetNeighborhoodQueryParamsDto): GetNeighborhoodQueryParamsDto {
        return {
            status: params.status,
            lat: params.lat,
            lng: params.lng,
        };
    }

    public static domainToDto(neighborhood: Neighborhood): ResponseNeighborhoodDto {
        return {
            id: neighborhood.id,
            name: neighborhood.name,
            status: neighborhood.status,
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
