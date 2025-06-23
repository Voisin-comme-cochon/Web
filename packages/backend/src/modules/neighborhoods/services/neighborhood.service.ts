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
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { MailerService } from '../../mailer/services/mailer.service';
import { Templates } from '../../mailer/domain/templates.enum';
import { UsersService } from '../../users/services/users.service';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';

@Injectable()
export class NeighborhoodService {
    constructor(
        private readonly neighborhoodRepository: NeighborhoodRepository,
        private readonly objectStorageService: ObjectStorageService,
        private readonly mailerService: MailerService,
        private readonly userService: UsersService
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
        return Object.assign(new Neighborhood(), neighborhood, { images: links });
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

    async setNeighborhoodStatus(
        id: number,
        status: NeighborhoodStatusEntity,
        reason: string | null
    ): Promise<Neighborhood> {
        const prevNeighborhood = await this.neighborhoodRepository.getNeighborhoodById(id);
        if (!prevNeighborhood) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }
        const neighborhood = await this.neighborhoodRepository.setNeighborhoodStatus(id, status);
        if (!neighborhood) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        if (status === NeighborhoodStatusEntity.refused && (!reason || reason.trim() === '')) {
            throw new CochonError('reason_required', 'Reason is required for refusing a neighborhood', 400);
        }

        const creators = neighborhood.neighborhood_users?.filter((user) => user.role == NeighborhoodUserRole.ADMIN);
        if (neighborhood.neighborhood_users?.length == 0 || !creators || creators.length === 0) {
            throw new CochonError('no_admin_found', 'No admin found for this neighborhood', 404);
        }

        if (
            prevNeighborhood.status == NeighborhoodStatusEntity.accepted &&
            neighborhood.status === NeighborhoodStatusEntity.refused
        ) {
            await Promise.all(
                (neighborhood.neighborhood_users ?? []).map(async (creator) => {
                    const user = await this.userService.getUserById(creator.userId);
                    await this.mailerService.sendRawEmail({
                        to: [user.email],
                        subject: 'Quartier supprimé.',
                        template: Templates.DELETE_NEIGHBORHOOD,
                        context: {
                            neighborhoodName: neighborhood.name,
                            userName: user.firstName,
                            supportEmail: process.env.VCC_SUPPORT_EMAIL,
                            reason: reason,
                        },
                    });
                })
            );

            return neighborhood;
        }

        if (
            prevNeighborhood.status == NeighborhoodStatusEntity.refused &&
            neighborhood.status === NeighborhoodStatusEntity.accepted
        ) {
            await Promise.all(
                (neighborhood.neighborhood_users ?? []).map(async (creator) => {
                    const user = await this.userService.getUserById(creator.userId);
                    await this.mailerService.sendRawEmail({
                        to: [user.email],
                        subject: 'Quartier réouvert !',
                        template: Templates.REOPENED_NEIGHBORHOOD,
                        context: {
                            neighborhoodName: neighborhood.name,
                            userName: user.firstName,
                            supportEmail: process.env.VCC_SUPPORT_EMAIL,
                        },
                    });
                })
            );

            return neighborhood;
        }

        if (neighborhood.status === NeighborhoodStatusEntity.accepted) {
            await Promise.all(
                creators.map(async (creator) => {
                    const user = await this.userService.getUserById(creator.userId);
                    await this.mailerService.sendRawEmail({
                        to: [user.email],
                        subject: 'Demande de création de quartier acceptée !',
                        template: Templates.ACCEPTED_NEIGHBORHOOD,
                        context: {
                            neighborhoodName: neighborhood.name,
                            userName: user.firstName,
                            supportEmail: process.env.VCC_SUPPORT_EMAIL,
                        },
                    });
                })
            );
        }

        if (neighborhood.status === NeighborhoodStatusEntity.refused) {
            await Promise.all(
                creators.map(async (creator) => {
                    const user = await this.userService.getUserById(creator.userId);
                    await this.mailerService.sendRawEmail({
                        to: [user.email],
                        subject: 'Demande de création de quartier refusée !',
                        template: Templates.REFUSED_NEIGHBORHOOD,
                        context: {
                            neighborhoodName: neighborhood.name,
                            userName: user.firstName,
                            supportEmail: process.env.VCC_SUPPORT_EMAIL,
                            reason: reason,
                        },
                    });
                })
            );
        }
        return neighborhood;
    }

    async updateNeighborhood({
        id,
        name,
        description,
        userId,
    }: {
        id: number;
        name?: string;
        description?: string;
        userId: number;
    }): Promise<ResponseNeighborhoodDto> {
        const neighborhood = await this.neighborhoodRepository.getNeighborhoodById(id);
        if (!neighborhood) {
            throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
        }

        const isAdmin = neighborhood.neighborhood_users?.some(
            (user) => user.userId === userId && user.role === NeighborhoodUserRole.ADMIN
        );

        if (!isAdmin) {
            throw new CochonError('not_authorized', 'You are not authorized to update this neighborhood', 403);
        }

        const updatedNeighborhood = await this.neighborhoodRepository.updateNeighborhood(id, name, description);

        if (!updatedNeighborhood) {
            throw new CochonError('neighborhood_update_failed', 'Failed to update neighborhood', 500);
        }
        console.log('Updated neighborhood:', updatedNeighborhood);
        return NeighborhoodsAdapter.domainToDto(updatedNeighborhood);
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
        for (const fileName of filesNames) {
            const url = await this.objectStorageService.getFileLink(fileName.url, BucketType.NEIGHBORHOOD_IMAGES);
            entities.push(Object.assign(new NeighborhoodImagesEntity(), fileName, { url }));
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
