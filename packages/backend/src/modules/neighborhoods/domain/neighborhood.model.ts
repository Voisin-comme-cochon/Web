import { Geography } from 'typeorm';
import { NeighborhoodStatusEntity } from '../../../core/entities/neighborhood-status.entity';

export class Neighborhood {
    id!: number;
    name!: string;
    geo!: Geography;
    status!: NeighborhoodStatusEntity;
    description!: string;
    creationDate!: Date;
}
