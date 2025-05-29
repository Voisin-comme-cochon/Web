import { Geography } from 'typeorm';

export class Event {
    id!: number;
    createdBy!: number;
    neighborhoodId!: number;
    name!: string;
    description!: string;
    createdAt!: Date;
    dateStart!: Date;
    dateEnd!: Date;
    tagId!: number;
    min!: number;
    max!: number;
    photo!: string;
    addressStart!: Geography;
    addressEnd!: Geography;
}

export interface CreateEventInput {
    createdBy: number;
    neighborhoodId: number;
    name: string;
    description: string;
    dateStart: Date;
    dateEnd: Date;
    tagId: number;
    min: number;
    max: number;
    photo: Express.Multer.File;
    addressStart: string | null;
    addressEnd: string | null;
}
