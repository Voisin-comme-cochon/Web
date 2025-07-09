import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { NeighborhoodEntity } from './neighborhood.entity';
import { ItemAvailabilityEntity } from './item-availability.entity';
import { LoanRequestEntity } from './loan-request.entity';
import { LoanEntity } from './loan.entity';

@Entity({ name: 'items' })
export class ItemEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ length: 50, nullable: true })
    category?: string;

    @Column({ length: 255, nullable: true })
    image_url?: string;

    @Column()
    owner_id!: number;

    @Column()
    neighborhood_id!: number;

    @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamptz' })
    created_at!: Date;

    @ManyToOne(() => UserEntity, (user) => user.owned_items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner!: UserEntity;

    @ManyToOne(() => NeighborhoodEntity, (neighborhood) => neighborhood.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'neighborhood_id' })
    neighborhood!: NeighborhoodEntity;

    @OneToMany(() => ItemAvailabilityEntity, (availability) => availability.item, { cascade: true })
    availabilities?: ItemAvailabilityEntity[];

    @OneToMany(() => LoanRequestEntity, (request) => request.item, { cascade: true })
    loan_requests?: LoanRequestEntity[];

    @OneToMany(() => LoanEntity, (loan) => loan.item, { cascade: true })
    loans?: LoanEntity[];
}
