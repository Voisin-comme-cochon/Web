import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TicketMessageEntity } from './ticket-message.entity';
import { TicketStatusEnum } from './ticket-status.enum';
import { TicketPriorityEnum } from './ticket-priority.enum';

@Entity({ name: 'tickets' })
export class TicketEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    subject!: string;

    @Column({ name: 'user_id', type: 'int' })
    userId!: number;

    @Column({ type: 'enum', enum: TicketStatusEnum })
    status!: TicketStatusEnum;

    @Column({ type: 'enum', enum: TicketPriorityEnum })
    priority!: TicketPriorityEnum;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @OneToMany(() => TicketMessageEntity, (message) => message.ticket, { cascade: true })
    messages?: TicketMessageEntity[];
}
