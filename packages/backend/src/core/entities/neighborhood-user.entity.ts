import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NeighborhoodEntity } from './neighborhood.entity';
import { UserEntity } from './user.entity';

export enum NeighborhoodUserRole {
    ADMIN = 'admin',
    USER = 'user',
    JOURNALIST = 'journalist',
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

    @Column({ default: NeighborhoodUserRole.USER, type: 'enum', enum: NeighborhoodUserRole })
    role!: string;

    @Column({ default: NeighborhoodUserStatus.PENDING, type: 'enum', enum: NeighborhoodUserStatus })
    status!: string;

    @ManyToOne(() => NeighborhoodEntity, (neighborhood) => neighborhood.neighborhood_users)
    @JoinColumn({ name: 'neighborhoodId' })
    neighborhood!: NeighborhoodEntity;

    @Column()
    neighborhoodId!: number;

    @ManyToOne(() => UserEntity, (user) => user.neighborhood_users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @Column()
    userId!: number;
}
