import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LoanRequestEntity } from './loan-request.entity';
import { ItemEntity } from './item.entity';
import { UserEntity } from './user.entity';

export enum LoanStatus {
    ACTIVE = 'active',
    PENDING_RETURN = 'pending_return',
    RETURNED = 'returned',
    OVERDUE = 'overdue',
}

@Entity({ name: 'loans' })
export class LoanEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    loan_request_id!: number;

    @Column()
    item_id!: number;

    @Column()
    borrower_id!: number;

    @Column({ type: 'date' })
    start_date!: Date;

    @Column({ type: 'date' })
    end_date!: Date;

    @Column({ type: 'date', nullable: true })
    actual_return_date?: Date;

    @Column({ nullable: true })
    return_confirmed_by?: number;

    @Column({ type: 'timestamptz', nullable: true })
    return_confirmed_at?: Date;

    @Column({
        type: 'enum',
        enum: LoanStatus,
        enumName: 'loan_item_status_enum',
        default: LoanStatus.ACTIVE,
    })
    status!: LoanStatus;

    @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamptz' })
    created_at!: Date;

    @ManyToOne(() => LoanRequestEntity, (request) => request.loans, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'loan_request_id' })
    loan_request!: LoanRequestEntity;

    @ManyToOne(() => ItemEntity, (item) => item.loans, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'item_id' })
    item!: ItemEntity;

    @ManyToOne(() => UserEntity, (user) => user.loans, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'borrower_id' })
    borrower!: UserEntity;
}
