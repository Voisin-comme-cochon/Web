import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NeighborhoodEntity } from './neighborhood.entity';

@Entity({ name: 'neighborhood_images' })
export class NeighborhoodImagesEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    url!: string;

    @Column()
    isPrimary!: boolean;

    @ManyToOne(() => NeighborhoodEntity, (neighborhood) => neighborhood.images)
    @JoinColumn({ name: 'neighborhoodId' })
    neighborhood?: NeighborhoodEntity;

    @Column()
    neighborhoodId!: number;
}
