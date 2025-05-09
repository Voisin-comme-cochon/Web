import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';
import { TicketStatusEnum } from '../../../../core/entities/ticket-status.enum';
import { TicketPriorityEnum } from '../../../../core/entities/ticket-priority.enum';

export class ResponseTicketDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the Ticket',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        example: 'Bug in the app',
        description: 'The subject of the Ticket',
    })
    @IsString()
    subject!: string;

    @ApiProperty({
        example: 'open',
        description: 'The status of the Ticket',
    })
    @IsString()
    status!: TicketStatusEnum;

    @ApiProperty({
        example: 'low',
        description: 'The priority of the Ticket',
    })
    @IsString()
    priority!: TicketPriorityEnum;

    @ApiProperty({
        example: '01/02/2025',
        description: 'The creation date of the Ticket',
    })
    @IsDate()
    createdAt!: Date;
}

export class StatusTicketDto {
    @ApiProperty({
        example: 'open',
        description: 'The status of the Ticket',
    })
    status!: TicketStatusEnum | null;
}
