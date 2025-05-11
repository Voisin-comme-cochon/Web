import { Column, Entity, Geography, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { NeighborhoodEntity } from './neighborhood.entity';
import { TagEntity } from './tag.entity';
import { EventRegistrationEntity } from './event-registration.entity';

@Entity({ name: 'events' })
export class EventEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    createdBy!: number;

    @Column()
    neighborhoodId!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamptz' })
    dateStart!: Date;

    @Column({ type: 'timestamptz' })
    dateEnd!: Date;

    @Column()
    tagId!: number;

    @Column({ default: 0 })
    min!: number;

    @Column()
    max!: number;

    @Column()
    photo!: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        nullable: true,
    })
    addressStart!: Geography;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        nullable: true,
    })
    addressEnd!: Geography;

    // Clés étrangères
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'createdBy' })
    creator?: UserEntity;

    @ManyToOne(() => NeighborhoodEntity)
    @JoinColumn({ name: 'neighborhoodId' })
    neighborhood?: NeighborhoodEntity;

    @ManyToOne(() => TagEntity)
    @JoinColumn({ name: 'tagId' })
    tag?: TagEntity;

    @OneToMany(() => EventRegistrationEntity, (registration) => registration.event)
    registrations?: EventRegistrationEntity[];
}
