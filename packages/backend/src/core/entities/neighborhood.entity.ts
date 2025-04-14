import { Column, Entity, Geometry, PrimaryGeneratedColumn } from 'typeorm';
import { IsISO8601 } from 'class-validator';
import { NeighborhoodStatusEntity } from './neighborhood-status.entity';

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

    @Column({
        type: 'enum',
        enum: NeighborhoodStatusEntity,
        default: NeighborhoodStatusEntity.waiting,
    })
    status!: NeighborhoodStatusEntity;

    @Column()
    description!: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    @IsISO8601()
    creationDate!: Date;
}
