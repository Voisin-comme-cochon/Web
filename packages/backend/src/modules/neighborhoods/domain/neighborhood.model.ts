import { Geography } from 'typeorm';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { NeighborhoodImage } from './neighborhood-image.model';

export class Neighborhood {
    id!: number;
    name!: string;
    geo!: Geography;
    status!: NeighborhoodStatusEntity;
    description!: string;
    creationDate!: Date;
    images?: NeighborhoodImage[];
}

export interface CreateNeighborhoodInput {
    name: string;
    description: string;
    geo: string;
    userId: string;
    files: Express.Multer.File[];
}

export interface GetNeighborhoodQueryParams {
    status?: NeighborhoodStatusEntity;
}
