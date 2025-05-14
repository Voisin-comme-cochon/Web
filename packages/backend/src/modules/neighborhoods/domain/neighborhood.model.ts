import { Geography } from 'typeorm';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';
import { User } from '../../users/domain/user.model';
import { NeighborhoodImage } from './neighborhood-image.model';

export class Neighborhood {
    id!: number;
    name!: string;
    geo!: Geography;
    status!: NeighborhoodStatusEntity;
    description!: string;
    creationDate!: Date;
    images?: NeighborhoodImage[];
    neighborhood_users?: User[];
}

export interface CreateNeighborhoodInput {
    name: string;
    description: string;
    geo: string;
    userId: number;
    files: Express.Multer.File[];
}

export interface GetNeighborhoodQueryParams {
    status?: NeighborhoodStatusEntity;
}
