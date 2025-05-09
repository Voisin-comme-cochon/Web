import { SenderTicketMessageEnum } from '../../../core/entities/sender-ticket-message.enum';
import { TicketMessageTypeEnum } from '../../../core/entities/ticket-message-type.enum';

export class TicketMessages {
    id!: number;
    content!: string;
    sender!: SenderTicketMessageEnum;
    type!: TicketMessageTypeEnum;
    createdAt!: Date;
    ticketId!: number;
}
