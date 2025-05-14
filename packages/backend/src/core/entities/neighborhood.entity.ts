import { Column, Entity, Geography, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NeighborhoodStatusEntity } from './neighborhood-status.entity';
import { EventEntity } from './event.entity';
import { NeighborhoodImagesEntity } from './neighborhood-images.entity';
import { NeighborhoodUserEntity } from './neighborhood-user.entity';
import { NeighborhoodInvitationEntity } from './neighborhood-invitation.entity';

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

    @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamptz' })
    creationDate!: Date;

    // clé étrangères :
    @OneToMany(() => EventEntity, (event) => event.neighborhood, { onDelete: 'CASCADE' })
    neighborhood_events?: EventEntity[];

    @OneToMany(() => NeighborhoodUserEntity, (user) => user.neighborhood, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    neighborhood_users?: NeighborhoodUserEntity[];

    @OneToMany(() => NeighborhoodInvitationEntity, (invitation) => invitation.neighborhood, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    neighborhood_invitations?: NeighborhoodInvitationEntity[];
}
