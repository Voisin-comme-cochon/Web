import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsString } from 'class-validator';
import { TicketMessageTypeEnum } from './ticket-message-type.enum';
import { SenderTicketMessageEnum } from './sender-ticket-message.enum';
import { TicketEntity } from './ticket.entity';

@Entity({ name: 'ticket_messages' })
export class TicketMessageEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    @IsString()
    content!: string;

    @Column({ type: 'enum', enum: SenderTicketMessageEnum })
    sender!: SenderTicketMessageEnum;

    @ManyToOne(() => TicketEntity, (ticket) => ticket.messages, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'ticketId' })
    ticket?: TicketEntity;

    @Column({ name: 'ticketId', type: 'int' })
    ticketId!: number;

    @Column({ type: 'enum', enum: TicketMessageTypeEnum })
    type!: TicketMessageTypeEnum;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}
