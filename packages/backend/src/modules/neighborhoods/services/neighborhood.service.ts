import { Injectable } from '@nestjs/common';
import { Geography } from 'typeorm';
import { ObjectStorageService } from 'src/modules/objectStorage/services/objectStorage.service';
import { CochonError } from 'src/utils/CochonError';
import { BucketType } from 'src/modules/objectStorage/domain/bucket-type.enum';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';
import { CreateNeighborhoodInput, GetNeighborhoodQueryParams, Neighborhood } from '../domain/neighborhood.model';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodImagesEntity } from '../../../core/entities/neighborhood-images.entity';
import { ResponseNeighborhoodDto } from '../controllers/dto/neighborhood.dto';
import {
    NeighborhoodUserEntity,
    NeighborhoodUserRole,
    NeighborhoodUserStatus,
} from '../../../core/entities/neighborhood-user.entity';
import { isNotNull } from '../../../utils/tools';

@Injectable()
export class NeighborhoodService {
    constructor(
        private readonly neighborhoodRepository: NeighborhoodRepository,
        private readonly objectStorageService: ObjectStorageService
    ) {}

    async getAllNeighborhoods(
        params: GetNeighborhoodQueryParams,
        page: number,
        limit: number
    ): Promise<[Neighborhood[], number]> {
        const [neighborhoods, count] = await this.neighborhoodRepository.getAllNeighborhoods(params, page, limit);
        if (isNotNull(params.lat) && isNotNull(params.lng)) {
            const urlNeighborhoods = await this.listReplaceUrlsByLinks(neighborhoods);
            return [urlNeighborhoods, count];
        }
        return [neighborhoods, count];
    }

    async getNeighborhoodById(id: number): Promise<Neighborhood | null> {
        const neighborhood = await this.neighborhoodRepository.getNeighborhoodById(id);
        if (!neighborhood) {
            return null;
        }
        return await this.replaceUrlsByLinks(neighborhood);
    }

    async replaceUrlsByLinks(neighborhood: Neighborhood): Promise<Neighborhood> {
        const links = await this.getFileLinkByUrl(neighborhood.images ?? []);
        return {
            ...neighborhood,
            images: links,
        };
    }

    async listReplaceUrlsByLinks(neighborhoods: Neighborhood[]): Promise<Neighborhood[]> {
        return Promise.all(
            neighborhoods.map((neighborhood: Neighborhood) => {
                return this.replaceUrlsByLinks(neighborhood);
            })
        );
    }

    async createNeighborhood(input: CreateNeighborhoodInput): Promise<ResponseNeighborhoodDto> {
        const { name, description, geo, files, userId } = input;

        const parsedGeo = this.parseGeo(geo);
        const images = await this.createAndUploadImageEntities(files);
        const creatorUserEntity = this.createAdminUser(userId);

        const neighborhood = new NeighborhoodEntity();
        neighborhood.name = name;
        neighborhood.description = description;
        neighborhood.geo = parsedGeo;
        neighborhood.images = images;
        neighborhood.creationDate = new Date();
        neighborhood.neighborhood_users = [creatorUserEntity];

        return this.neighborhoodRepository.createNeighborhood(neighborhood);
    }

    private parseGeo(geo: string): Geography {
        try {
            return JSON.parse(geo) as Geography;
        } catch (err) {
            if (err instanceof SyntaxError) {
                throw new CochonError('invalid_geo', 'Invalid geo format', 400);
            }
            throw new CochonError('geo_parsing_error', 'Error parsing geo', 500);
        }
    }

    private async createAndUploadImageEntities(files: Express.Multer.File[]): Promise<NeighborhoodImagesEntity[]> {
        const entities: NeighborhoodImagesEntity[] = [];
        for (let i = 0; i < files.length; i++) {
            const url = await this.objectStorageService.uploadFile(
                files[i].buffer,
                files[i].originalname,
                BucketType.NEIGHBORHOOD_IMAGES
            );
            entities.push({ url, isPrimary: i === 0 } as NeighborhoodImagesEntity);
        }
        return entities;
    }

    private async getFileLinkByUrl(filesNames: NeighborhoodImagesEntity[]): Promise<NeighborhoodImagesEntity[]> {
        const entities: NeighborhoodImagesEntity[] = [];
        for (let i = 0; i < filesNames.length; i++) {
            const url = await this.objectStorageService.getFileLink(filesNames[i].url, BucketType.NEIGHBORHOOD_IMAGES);
            entities.push({ ...filesNames[i], url } as NeighborhoodImagesEntity);
        }
        return entities;
    }

    private createAdminUser(userId: number): NeighborhoodUserEntity {
        const adminUser = new NeighborhoodUserEntity();
        adminUser.userId = userId;
        adminUser.status = NeighborhoodUserStatus.ACCEPTED;
        adminUser.role = NeighborhoodUserRole.ADMIN;
        return adminUser;
    }
}
