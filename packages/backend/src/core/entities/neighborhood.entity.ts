import { Column, Entity, Geometry, PrimaryGeneratedColumn } from 'typeorm';
import { IsISO8601 } from 'class-validator';

@Entity({ name: 'neighborhoods' })
export class NeighborhoodEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326,
    })
    geo!: Geometry;

    @Column()
    status!: string;

    @Column({ default: 'waiting' }) // waiting, refused, accepted
    description!: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    @IsISO8601()
    creationDate!: Date;
}
