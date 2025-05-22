import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesService } from '../services/sales.service';
import { SalesAdapter } from '../adapters/sales.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { NeighborhoodService } from '../../neighborhoods/services/neighborhood.service';
import { CochonError } from '../../../utils/CochonError';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { GetSalesByIdQueryParamsDto, ResponseSalesDto } from './dto/sales.dto';

@ApiTags('sales')
@Controller('sales')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
export class SalesController {
    constructor(
        private readonly salesService: SalesService,
        private readonly neighborhoodService: NeighborhoodService
    ) {}

    @Get()
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({ summary: 'Get all tags' })
    @ApiOkResponse({ description: 'Tags found', type: ResponseSalesDto })
    @ApiNotFoundResponse({ description: 'Tags not found' })
    @UseGuards(IsSuperAdminGuard)
    async getSales(@Query() pagination: Paging): Promise<Paginated<ResponseSalesDto>> {
        const [sales, count] = await this.salesService.getSales(pagination.page, pagination.limit);
        const neighborhoods = await Promise.all(
            sales.map(async (sale) => {
                const neighborhood = await this.neighborhoodService.getNeighborhoodById(sale.neighborhoodId);
                if (!neighborhood) {
                    throw new CochonError('neighborhood-not-found', 'Neighborhood not found');
                }
                return neighborhood;
            })
        );
        const responseUsers = SalesAdapter.listDomainToResponseSales(sales, neighborhoods);
        return new Paginated(responseUsers, pagination, count);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get sales by id' })
    @ApiOkResponse({ description: 'Sales found', type: ResponseSalesDto })
    @ApiNotFoundResponse({ description: 'Sales not found' })
    async getSalesById(@Param() params: GetSalesByIdQueryParamsDto): Promise<ResponseSalesDto> {
        const sales = await this.salesService.getSaleById(params.saleId);
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(sales.neighborhoodId);
        if (!neighborhood) {
            throw new CochonError('neighborhood-not-found', 'Neighborhood not found');
        }
        return SalesAdapter.domainToResponseSale(sales, neighborhood);
    }
}
