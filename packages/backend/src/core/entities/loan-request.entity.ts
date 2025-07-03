import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ItemEntity } from './item.entity';
import { UserEntity } from './user.entity';
import { LoanEntity } from './loan.entity';

export enum LoanRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
}

@Entity({ name: 'loan_requests' })
export class LoanRequestEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    item_id!: number;

    @Column()
    borrower_id!: number;

    @Column({ type: 'date' })
    start_date!: Date;

    @Column({ type: 'date' })
    end_date!: Date;

    @Column({
        type: 'enum',
        enum: LoanRequestStatus,
        enumName: 'item_loan_request_status_enum',
        default: LoanRequestStatus.PENDING,
    })
    status!: LoanRequestStatus;

    @Column({ type: 'text', nullable: true })
    message?: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamptz' })
    created_at!: Date;

    @ManyToOne(() => ItemEntity, (item) => item.loan_requests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'item_id' })
    item!: ItemEntity;

    @ManyToOne(() => UserEntity, (user) => user.loan_requests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'borrower_id' })
    borrower!: UserEntity;

    @OneToMany(() => LoanEntity, (loan) => loan.loan_request, { cascade: true })
    loans?: LoanEntity[];
}
