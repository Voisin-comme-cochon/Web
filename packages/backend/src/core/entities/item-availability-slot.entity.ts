import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ItemAvailabilityEntity } from './item-availability.entity';
import { LoanRequestEntity } from './loan-request.entity';

export enum ItemAvailabilitySlotStatus {
    AVAILABLE = 'available',
    RESERVED = 'reserved',
    OCCUPIED = 'occupied',
}

@Entity({ name: 'item_availability_slots' })
export class ItemAvailabilitySlotEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    availability_id!: number;

    @Column({ type: 'date' })
    start_date!: Date;

    @Column({ type: 'date' })
    end_date!: Date;

    @Column({
        type: 'enum',
        enum: ItemAvailabilitySlotStatus,
        enumName: 'item_availability_slot_status_enum',
        default: ItemAvailabilitySlotStatus.AVAILABLE,
    })
    status!: ItemAvailabilitySlotStatus;

    @Column({ nullable: true })
    loan_request_id?: number;

    @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamptz' })
    created_at!: Date;

    @ManyToOne(() => ItemAvailabilityEntity, (availability) => availability.slots, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'availability_id' })
    availability!: ItemAvailabilityEntity;

    @ManyToOne(() => LoanRequestEntity, (loanRequest) => loanRequest.slots, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'loan_request_id' })
    loan_request?: LoanRequestEntity;
}