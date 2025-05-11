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
