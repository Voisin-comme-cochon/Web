import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ItemEntity } from './item.entity';

export enum ItemAvailabilityStatus {
    AVAILABLE = 'available',
    PARTIALLY_BOOKED = 'partially_booked',
    UNAVAILABLE = 'unavailable',
}

@Entity({ name: 'item_availabilities' })
export class ItemAvailabilityEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    item_id!: number;

    @Column({ type: 'date' })
    start_date!: Date;

    @Column({ type: 'date' })
    end_date!: Date;

    @Column({
        type: 'enum',
        enum: ItemAvailabilityStatus,
        enumName: 'item_sharing_availability_status_enum',
        default: ItemAvailabilityStatus.AVAILABLE,
    })
    status!: ItemAvailabilityStatus;

    @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamptz' })
    created_at!: Date;

    @ManyToOne(() => ItemEntity, (item) => item.availabilities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'item_id' })
    item!: ItemEntity;
}
