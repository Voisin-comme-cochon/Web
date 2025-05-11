import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketsService } from '../services/tickets.service';
import { TicketsAdapter } from '../adapters/tickets.adapter';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { getTicketsQueryDto, ResponseTicketDto } from './dto/tickets.dto';

@ApiTags('tickets')
@UseGuards(IsLoginGuard, IsSuperAdminGuard)
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Get()
    @ApiOperation({ summary: 'Get tickets' })
    @ApiOkResponse({ description: 'Tickets found', type: ResponseTicketDto })
    @ApiNotFoundResponse({ description: 'Tickets not found' })
    async getUserById(
        @Query() query: getTicketsQueryDto,
        @Query() pagination: Paging
    ): Promise<Paginated<ResponseTicketDto> | Paginated<[]>> {
        const [tickets, count] = await this.ticketsService.getTickets(
            query.status,
            query.priority,
            pagination.page,
            pagination.limit
        );
        const responseTicket = TicketsAdapter.listDomainToResponseTicket(tickets);
        return new Paginated(responseTicket, pagination, count);
    }
}
