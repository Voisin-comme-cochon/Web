import { Column, Entity, Geography, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsISO8601 } from 'class-validator';
import { NeighborhoodStatusEntity } from './neighborhood-status.entity';
import { EventEntity } from './event.entity';
import { NeighborhoodImagesEntity } from './neighborhood-images.entity';

@Entity({ name: 'neighborhoods' })
export class NeighborhoodEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        nullable: true,
    })
    geo!: Geography;

    @Column({
        type: 'enum',
        enum: NeighborhoodStatusEntity,
        default: NeighborhoodStatusEntity.waiting,
    })
    status!: NeighborhoodStatusEntity;

    @Column()
    description!: string;

    @OneToMany(() => NeighborhoodImagesEntity, (image) => image.neighborhood, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    images!: NeighborhoodImagesEntity[];

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    @IsISO8601()
    creationDate!: Date;

    // clé étrangères :
    @OneToMany(() => EventEntity, (event) => event.neighborhood)
    neighborhood_events?: EventEntity[];
}
