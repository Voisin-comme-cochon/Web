import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NeighborhoodEntity } from './neighborhood.entity';

export enum NeighborhoodUserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum NeighborhoodUserStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

@Entity({ name: 'neighborhood_user' })
export class NeighborhoodUserEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: NeighborhoodUserStatus.PENDING, type: 'enum', enum: NeighborhoodUserStatus })
    role!: string;

    @Column({ default: NeighborhoodUserRole.USER, type: 'enum', enum: NeighborhoodUserRole })
    status!: string;

    @ManyToOne(() => NeighborhoodEntity, (neighborhood) => neighborhood.images)
    @JoinColumn({ name: 'neighborhoodId' })
    neighborhood!: NeighborhoodEntity;

    @Column()
    neighborhoodId!: number;
}
