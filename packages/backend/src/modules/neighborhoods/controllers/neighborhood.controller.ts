import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeighborhoodService } from '../services/neighborhood.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { RequestNeighborhoodDto, ResponseNeighborhoodDto, StatusNeighborhoodDto } from './dto/neighborhood.dto';

@ApiTags('neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodController {
    constructor(private readonly neighborhoodService: NeighborhoodService) {}

    @Get()
    @ApiOperation({ summary: 'Get all neighborhoods' })
    @ApiOkResponse({
        description: 'Get all neighborhoods',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhoods not found',
    })
    async getAllNeighborhoods(
        @Query() query: StatusNeighborhoodDto,
        @Query() pagination: Paging
    ): Promise<Paginated<ResponseNeighborhoodDto>> {
        const [neighborhoods, count] = await this.neighborhoodService.getAllNeighborhoods(
            query.status,
            pagination.page,
            pagination.limit
        );
        return new Paginated(neighborhoods, pagination, count);
    }

    @Post()
    @ApiOperation({ summary: 'Create a neighborhood' })
    @ApiOkResponse({
        description: 'Neighborhood created',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not created',
    })
    @UseGuards(IsLoginGuard)
    async createNeighborhood(
        @Body() body: RequestNeighborhoodDto,
        @Request()
        req: {
            user: { id: string };
        }
    ): Promise<ResponseNeighborhoodDto> {
        return this.neighborhoodService.createNeighborhood(body.name, body.description, body.geo, req.user.id);
    }
}
