import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesService } from '../services/sales.service';
import { SalesAdapter } from '../adapters/sales.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { ResponseSalesDto } from './dto/sales.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
    constructor(private readonly tagsService: SalesService) {}

    @Get()
    @ApiOperation({ summary: 'Get all tags' })
    @ApiOkResponse({ description: 'Tags found', type: ResponseSalesDto })
    @ApiNotFoundResponse({ description: 'Tags not found' })
    async getSales(@Query() pagination: Paging): Promise<Paginated<ResponseSalesDto>> {
        const [tags, count] = await this.tagsService.getSales(pagination.page, pagination.limit);
        const responseUsers = SalesAdapter.listDomainToResponseTag(tags);
        return new Paginated(responseUsers, pagination, count);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get sales by id' })
    @ApiOkResponse({ description: 'Sales found', type: ResponseSalesDto })
    @ApiNotFoundResponse({ description: 'Sales not found' })
    async getSalesById(@Param('id') id: string): Promise<ResponseSalesDto> {
        const numberId = parseInt(id, 10);
        const sales = await this.tagsService.getSaleById(numberId);
        return SalesAdapter.domainToResponseTag(tag);
    }
}
