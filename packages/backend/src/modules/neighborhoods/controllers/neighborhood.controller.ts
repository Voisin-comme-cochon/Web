import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Request,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NeighborhoodService } from '../services/neighborhood.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { NeighborhoodsAdapter } from '../adapters/neighborhoods.adapter';
import { CochonError } from '../../../utils/CochonError';
import { NeighborhoodInvitationService } from '../services/neighborhood-invitation.service';
import { NeighborhoodAppService } from '../services/neighborhood-app.service';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import {
    CreateNeighborhoodInvitationDto,
    GetNeighborhoodInvitationQueryParams,
} from './dto/neighborhood-invitation.dto';
import { ResponseNeighborhoodDto, GetNeighborhoodQueryParamsDto, RequestNeighborhoodDto } from './dto/neighborhood.dto';

@ApiTags('Neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodController {
    constructor(
        private readonly neighborhoodAppService: NeighborhoodAppService,
        private readonly neighborhoodService: NeighborhoodService,
        private readonly neighborhoodInvitationService: NeighborhoodInvitationService
    ) {}

    @Get()
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({ summary: 'Get all neighborhoods' })
    @ApiOkResponse({
        description: 'Get all neighborhoods',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhoods not found',
    })
    async getAllNeighborhoods(
        @Query() query: GetNeighborhoodQueryParamsDto,
        @Query() pagination: Paging
    ): Promise<Paginated<ResponseNeighborhoodDto>> {
        const [neighborhood, count] = await this.neighborhoodService.getAllNeighborhoods(
            NeighborhoodsAdapter.queryParamsDtoToDomain(query),
            pagination.page,
            pagination.limit
        );
        return new Paginated(
            neighborhood.map((neighborhood) => NeighborhoodsAdapter.domainToDto(neighborhood)),
            pagination,
            count
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a neighborhood by id' })
    @ApiOkResponse({
        description: 'Neighborhood found',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found',
    })
    async getNeighborhoodById(@Param('id') id: string): Promise<ResponseNeighborhoodDto> {
        const numberId = parseInt(id, 10);
        const neighborhood = await this.neighborhoodService.getNeighborhoodById(numberId);

        if (!neighborhood) {
            throw new CochonError('neighborhood-not-found', 'Neighborhood not found', 404);
        }

        return NeighborhoodsAdapter.domainToDto(neighborhood);
    }

    @Post()
    @ApiOperation({ summary: 'Create a neighborhood' })
    @ApiOkResponse({ description: 'Neighborhood created', type: ResponseNeighborhoodDto })
    @ApiNotFoundResponse({ description: 'Neighborhood not created' })
    @UseGuards(IsLoginGuard)
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('images'))
    @ApiConsumes('multipart/form-data')
    createNeighborhood(
        @Body() body: RequestNeighborhoodDto,
        @UploadedFiles() files: Express.Multer.File[] = [],
        @Request() req: { user: { id: string } }
    ): Promise<ResponseNeighborhoodDto> {
        return this.neighborhoodAppService.createNeighborhoodAndInvite({
            name: body.name,
            description: body.description,
            geo: body.geo,
            userId: Number(req.user.id),
            files,
            inviteEmails: body.inviteEmails,
        });
    }

    @Get('invitation/:token')
    @ApiOperation({ summary: 'Get a neighborhood invitation by token' })
    @ApiOkResponse({
        description: 'Neighborhood invitation found',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood invitation not found',
    })
    @UseGuards(IsLoginGuard, IsSuperAdminGuard)
    async getInvitationByToken(@Param() param: GetNeighborhoodInvitationQueryParams) {
        return this.neighborhoodInvitationService.findInvitationByToken(param.token);
    }

    @Post('invitation')
    @ApiOperation({ summary: 'Create a neighborhood invitation' })
    @ApiOkResponse({
        description: 'Neighborhood invitation created',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood invitation not created',
    })
    @UseGuards(IsLoginGuard, IsSuperAdminGuard)
    async createInvitation(@Body() body: CreateNeighborhoodInvitationDto, @Request() req: { user: { id: string } }) {
        return this.neighborhoodInvitationService.createInvitation({
            neighborhoodId: body.neighborhoodId,
            maxUse: body.maxUse,
            durationInDays: body.durationInDays,
            createdBy: Number(req.user.id),
            email: body.email,
        });
    }
}
