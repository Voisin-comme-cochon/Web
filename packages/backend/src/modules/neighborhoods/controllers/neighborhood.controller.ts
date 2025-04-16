import { Controller, Get, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeighborhoodService } from '../services/neighborhood.service';
import { Neighborhood } from '../domain/neighborhood.model';
import { ResponseNeighborhoodDto, StatusNeighborhoodDto } from './dto/neighborhood.dto';

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
    async getAllNeighborhoods(@Query() query: StatusNeighborhoodDto): Promise<Neighborhood[]> {
        return this.neighborhoodService.getAllNeighborhoods(query.status);
    }
}
