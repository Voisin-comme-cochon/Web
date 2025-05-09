import { Ticket } from '../domain/tickets.model';
import { ResponseTicketDto } from '../controllers/dto/tickets.dto';
import { TicketEntity } from '../../../core/entities/ticket.entity';
import { TicketMessages } from '../domain/ticket-messages.model';
import { TicketMessageEntity } from '../../../core/entities/ticket-message.entity';

export class TicketsAdapter {
    static entityToDomain(ticketEntity: TicketEntity): Ticket {
        return {
            id: ticketEntity.id,
            subject: ticketEntity.subject,
            userId: ticketEntity.userId,
            status: ticketEntity.status,
            priority: ticketEntity.priority,
            createdAt: ticketEntity.createdAt,
        };
    }

    static listEntityToDomain(ticketEntities: TicketEntity[]): Ticket[] {
        return ticketEntities.map((ticketEntity) => this.entityToDomain(ticketEntity));
    }

    static domainToEntity(ticket: Ticket, ticketMessages: TicketMessages[]): TicketEntity {
        return {
            id: ticket.id,
            subject: ticket.subject,
            userId: ticket.userId,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            messages: this.listDomainToTicketMessageEntity(ticketMessages),
        };
    }

    static domainToResponseTicket(ticket: Ticket): ResponseTicketDto {
        return {
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
        };
    }

    static listDomainToResponseTicket(tickets: Ticket[]): ResponseTicketDto[] {
        return tickets.map((ticketEntity) => this.domainToResponseTicket(ticketEntity));
    }

    static ticketMessageEntityToDomain(ticketMessageEntity: TicketMessageEntity): TicketMessages {
        return {
            id: ticketMessageEntity.id,
            content: ticketMessageEntity.content,
            sender: ticketMessageEntity.sender,
            type: ticketMessageEntity.type,
            createdAt: ticketMessageEntity.createdAt,
            ticketId: ticketMessageEntity.ticketId,
        };
    }

    static listTicketMessageEntityToDomain(ticketMessageEntities: TicketMessageEntity[]): TicketMessages[] {
        return ticketMessageEntities.map((ticketMessageEntity) =>
            this.ticketMessageEntityToDomain(ticketMessageEntity)
        );
    }

    static domainToTicketMessageEntity(ticketMessage: TicketMessages): TicketMessageEntity {
        return {
            id: ticketMessage.id,
            content: ticketMessage.content,
            sender: ticketMessage.sender,
            type: ticketMessage.type,
            createdAt: ticketMessage.createdAt,
            ticketId: ticketMessage.ticketId,
        };
    }

    static listDomainToTicketMessageEntity(ticketMessages: TicketMessages[]): TicketMessageEntity[] {
        return ticketMessages.map((ticketMessage) => this.domainToTicketMessageEntity(ticketMessage));
    }
}
