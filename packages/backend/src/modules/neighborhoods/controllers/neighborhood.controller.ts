import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
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
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { NeighborhoodUserService } from '../services/neighborhood-user.service';
import { isNull } from '../../../utils/tools';
import { UserAdapter } from '../../users/adapters/user.adapter';
import {
    CreateMultipleNeighborhoodInvitationsDto,
    CreatePublicNeighborhoodInvitationDto,
    GetByNeiborhoodId,
    GetNeiborhoodByUserIdDto,
    GetNeighborhoodInvitationQueryParams,
} from './dto/neighborhood-invitation.dto';
import {
    GetNeighborhoodQueryParamsDto,
    RequestNeighborhoodDto,
    ResponseNeighborhoodDto,
    SetStatusNeighborhoodDto,
} from './dto/neighborhood.dto';
import { ResponseNeighborhoodUserDto } from './dto/neighborhood-user.dto';

@ApiTags('Neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodController {
    constructor(
        private readonly neighborhoodService: NeighborhoodService,
        private readonly neighborhoodInvitationService: NeighborhoodInvitationService,
        private readonly neighborhoodUserService: NeighborhoodUserService
    ) {}

    /* Neighborhoods endpoints */

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
        return this.neighborhoodService.createNeighborhood({
            name: body.name,
            description: body.description,
            geo: body.geo,
            userId: Number(req.user.id),
            files,
        });
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Set neighborhood status' })
    @ApiOkResponse({
        description: 'Neighborhood status updated',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found',
    })
    @UseGuards(IsLoginGuard, IsSuperAdminGuard)
    @ApiBearerAuth()
    async setNeighborhoodStatus(
        @Param('id') id: string,
        @Query() query: SetStatusNeighborhoodDto
    ): Promise<ResponseNeighborhoodDto> {
        const numberId = parseInt(id, 10);
        const neighborhood = await this.neighborhoodService.setNeighborhoodStatus(numberId, query.status);

        return NeighborhoodsAdapter.domainToDto(neighborhood);
    }

    /* Neighborhood invitations endpoints */
    @Get('invitations/:token')
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

    @Post('invitations')
    @ApiOperation({ summary: 'Create multiple neighborhood invitations' })
    @ApiOkResponse({
        description: 'Neighborhood invitations created',
        type: [ResponseNeighborhoodDto],
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood invitations not created',
    })
    @UseGuards(IsLoginGuard)
    async createMultipleInvitations(
        @Body() body: CreateMultipleNeighborhoodInvitationsDto,
        @Request() req: { user: { id: string } }
    ) {
        return this.neighborhoodInvitationService.createMultipleInvitations({
            neighborhoodId: body.neighborhoodId,
            emails: body.emails,
            createdBy: Number(req.user.id),
            durationInDays: body.durationInDays,
        });
    }

    @Post('invitations/public')
    @ApiOperation({ summary: 'Create a public neighborhood invitation' })
    @ApiOkResponse({
        description: 'Public neighborhood invitation created',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Public neighborhood invitation not created',
    })
    @UseGuards(IsLoginGuard)
    async createPublicInvitation(
        @Body() body: CreatePublicNeighborhoodInvitationDto,
        @Request() req: { user: { id: string } }
    ) {
        return this.neighborhoodInvitationService.createPublicInvitation({
            neighborhoodId: body.neighborhoodId,
            maxUse: body.maxUse,
            createdBy: Number(req.user.id),
            durationInDays: body.durationInDays,
        });
    }

    @Get('invitations/verify/:token')
    @ApiOperation({ summary: 'Verify the invitation token and return neighborhood data' })
    @ApiOkResponse({
        description: 'Neighborhood invitation verified',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood invitation not found or invalid token',
    })
    @UseGuards(IsLoginGuard)
    @ApiBearerAuth()
    async verifyInvitationToken(
        @Param('token') token: string,
        @Request() req: { user: { id: string } }
    ): Promise<ResponseNeighborhoodDto> {
        const neighborhood = await this.neighborhoodInvitationService.verifyInvitationToken(
            token,
            parseInt(req.user.id, 10)
        );

        return NeighborhoodsAdapter.domainToDto(neighborhood);
    }

    @Post('invitations/accept/:token')
    @ApiOperation({ summary: 'Accept a neighborhood invitation' })
    @ApiOkResponse({
        description: 'Neighborhood invitation accepted',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood invitation not found or already accepted',
    })
    @UseGuards(IsLoginGuard)
    @ApiBearerAuth()
    async acceptInvitation(
        @Param('token') token: string,
        @Request() req: { user: { id: string } }
    ): Promise<{ success: boolean }> {
        const success = await this.neighborhoodInvitationService.acceptInvitation(token, parseInt(req.user.id));

        return {
            success,
        };
    }

    /* Neighborhood users endpoints */
    @Get(':neighborhoodId/users')
    @UseInterceptors(PaginationInterceptor)
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Get users by neighborhood ID' })
    @ApiOkResponse({
        description: 'Users found in the neighborhood',
        type: [ResponseNeighborhoodUserDto],
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found or no users in the neighborhood',
    })
    async getUsersByNeighborhoodId(
        @Param() params: GetByNeiborhoodId,
        @Query() pagination: Paging
    ): Promise<Paginated<ResponseNeighborhoodUserDto>> {
        const [usersWithRoles, count] = await this.neighborhoodUserService.getUsersByNeighborhood(
            params.neighborhoodId,
            pagination.page,
            pagination.limit
        );

        if (isNull(usersWithRoles) || usersWithRoles.length === 0) {
            throw new CochonError('neighborhood-users-not-found', 'No users found in the neighborhood', 404);
        }

        const responseUsers = usersWithRoles.map((userWithRole) => {
            const userDto = UserAdapter.domainToResponseUser(userWithRole.user);

            return Object.assign({}, userDto, {
                neighborhoodRole: userWithRole.role,
            });
        });

        return new Paginated(responseUsers, pagination, count);
    }

    @Get('users/:userId')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Get neighborhoods by user ID' })
    @ApiOkResponse({
        description: 'Neighborhoods found for the user',
        type: [ResponseNeighborhoodDto],
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'User not found or no neighborhoods found for the user',
    })
    async getNeighborhoodsByUserId(@Param() params: GetNeiborhoodByUserIdDto): Promise<ResponseNeighborhoodDto[]> {
        return await this.neighborhoodUserService.getNeighborhoodsByUserId(params.userId);
    }
}
