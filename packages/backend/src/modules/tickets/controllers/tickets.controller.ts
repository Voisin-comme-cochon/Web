import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketsService } from '../services/tickets.service';
import { TicketsAdapter } from '../adapters/tickets.adapter';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { getTicketsQueryDto, ResponseTicketDto } from './dto/tickets.dto';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Get()
    @ApiOperation({ summary: 'Get tickets' })
    @ApiOkResponse({ description: 'Tickets found', type: ResponseTicketDto })
    @UseGuards(IsSuperAdminGuard)
    @ApiNotFoundResponse({ description: 'Tickets not found' })
    async getTicketById(
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
