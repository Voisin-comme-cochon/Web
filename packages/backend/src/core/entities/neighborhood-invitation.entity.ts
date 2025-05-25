import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NeighborhoodEntity } from './neighborhood.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'neighborhood_invitations' })
export class NeighborhoodInvitationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    neighborhoodId!: number;

    @ManyToOne(() => NeighborhoodEntity)
    @JoinColumn({ name: 'neighborhoodId' })
    neighborhood!: NeighborhoodEntity;

    @Column({ unique: true })
    token!: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamptz' })
    createdAt!: Date;

    @Column({ type: 'timestamptz' })
    expiredAt!: Date;

    @Column({ default: 1 })
    maxUse!: number;

    @Column({ default: 0 })
    currentUse!: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'createdBy' })
    creator!: UserEntity;

    @Column()
    createdBy!: number;
}
