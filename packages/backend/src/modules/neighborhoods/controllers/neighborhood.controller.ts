import { Body, Controller, Get, Post, Query, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NeighborhoodService } from '../services/neighborhood.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
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
    async getAllNeighborhoods(@Query() query: StatusNeighborhoodDto): Promise<ResponseNeighborhoodDto[]> {
        return this.neighborhoodService.getAllNeighborhoods(query.status);
    }

    @Post()
    @ApiOperation({ summary: 'Create a neighborhood' })
    @ApiOkResponse({ description: 'Neighborhood created', type: ResponseNeighborhoodDto })
    @ApiNotFoundResponse({ description: 'Neighborhood not created' })
    @UseGuards(IsLoginGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @ApiConsumes('multipart/form-data')
    async createNeighborhood(
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('geo') geo: string,
        @UploadedFiles() files: Express.Multer.File[] = [],
        @Request() req: { user: { id: string } }
    ): Promise<ResponseNeighborhoodDto> {
        return this.neighborhoodService.createNeighborhood({
            name,
            description,
            geo,
            userId: req.user.id,
            files,
        });
    }
}
