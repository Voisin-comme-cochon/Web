import {
    Body,
    Controller,
    Delete,
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
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiGoneResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
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
import { NeighborhoodUserEntity } from '../../../core/entities/neighborhood-user.entity';
import { NeighborhoodInvitation } from '../domain/neighborhood-invitation.model';
import { ResponseUserDto } from '../../users/controllers/dto/users.dto';
import { Neo4jService } from '../../../neo4j/neo4j.service';
import { UsersService } from '../../users/services/users.service';
import {
    CreateMultipleNeighborhoodInvitationsDto,
    CreatePublicNeighborhoodInvitationDto,
    GetByNeiborhoodId,
    GetNeiborhoodByUserIdDto,
    GetNeighborhoodInvitationQueryParams,
    ResponseNeighborhoodWithMembersDto,
} from './dto/neighborhood-invitation.dto';
import {
    GetNeighborhoodQueryParamsDto,
    QueryGetManageUser,
    RequestNeighborhoodDto,
    RequestUpdateNeighborhoodDto,
    ResponseMemberNeighborhoodDto,
    ResponseNeighborhoodDto,
    SetStatusNeighborhoodDto,
    UpdateNeighborhoodUserDto,
} from './dto/neighborhood.dto';
import { ResponseNeighborhoodUserDto } from './dto/neighborhood-user.dto';

@ApiTags('Neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodController {
    constructor(
        private readonly neighborhoodService: NeighborhoodService,
        private readonly neighborhoodInvitationService: NeighborhoodInvitationService,
        private readonly neighborhoodUserService: NeighborhoodUserService,
        private readonly neo4jService: Neo4jService,
        private readonly usersService: UsersService
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

    @Patch(':neighborhoodId/users/:userId')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Update a member role or status in a neighborhood' })
    @ApiOkResponse({
        description: 'Member role or status updated in the neighborhood',
        type: ResponseNeighborhoodUserDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood or user not found',
    })
    async updateMemberInNeighborhood(
        @Param() params: { neighborhoodId: number; userId: number },
        @Body() body: UpdateNeighborhoodUserDto,
        @Request() req: { user: { id: number } }
    ): Promise<NeighborhoodUserEntity> {
        return await this.neighborhoodUserService.updateMemberInNeighborhood(
            params.neighborhoodId,
            params.userId,
            req.user.id,
            body.role,
            body.status
        );
    }

    @Patch(':neighborhoodId/manage')
    @ApiOperation({ summary: 'Update neighborhood details' })
    @ApiOkResponse({
        description: 'Neighborhood details updated',
        type: ResponseNeighborhoodDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found',
    })
    @UseGuards(IsLoginGuard)
    @ApiBearerAuth()
    async updateNeighborhood(
        @Param('neighborhoodId') neighborhoodId: number,
        @Body() body: RequestUpdateNeighborhoodDto,
        @Request() req: { user: { id: number } }
    ): Promise<{ success: boolean }> {
        await this.neighborhoodService.updateNeighborhood({
            id: neighborhoodId,
            name: body.name,
            description: body.description,
            userId: req.user.id,
        });

        return { success: true };
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
        @Param('id') id: number,
        @Query() query: SetStatusNeighborhoodDto,
        @Body('reason') reason: string | null
    ): Promise<ResponseNeighborhoodDto> {
        const neighborhood = await this.neighborhoodService.setNeighborhoodStatus(id, query.status, reason);

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
    @ApiOperation({ summary: 'Verify the invitation token and return neighborhood data with members' })
    @ApiOkResponse({
        description: 'Neighborhood invitation verified',
        type: ResponseNeighborhoodWithMembersDto,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood invitation not found or invalid token',
    })
    @ApiGoneResponse({
        description: 'Neighborhood invitation token has expired',
    })
    @UseGuards(IsLoginGuard)
    @ApiBearerAuth()
    async verifyInvitationToken(
        @Param('token') token: string,
        @Request() req: { user: { id: string } }
    ): Promise<ResponseNeighborhoodWithMembersDto> {
        return await this.neighborhoodInvitationService.verifyInvitationTokenWithMembers(
            token,
            parseInt(req.user.id, 10)
        );
    }

    @Post('invitations/accept/:token')
    @ApiOperation({ summary: 'Accept a neighborhood invitation' })
    @ApiOkResponse({
        description: 'Neighborhood invitation accepted',
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood invitation not found or already accepted',
    })
    @ApiGoneResponse({
        description: 'Neighborhood invitation token has expired',
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

    @Post(':neighborhoodId/join')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Join a neighborhood' })
    @ApiOkResponse({
        description: 'User has requested to join the neighborhood',
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found or user already in the neighborhood',
    })
    async joinNeighborhood(
        @Param('neighborhoodId') neighborhoodId: number,
        @Request() req: { user: { id: number } }
    ): Promise<void> {
        await this.neighborhoodUserService.joinNeighborhood(req.user.id, neighborhoodId);
    }

    @Delete(':neighborhoodId/users/:userId')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Remove a member from a neighborhood' })
    @ApiOkResponse({
        description: 'Member removed from the neighborhood',
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood or user not found',
    })
    async removeMemberFromNeighborhood(
        @Param() params: { neighborhoodId: number; userId: number },
        @Request() req: { user: { id: number } }
    ): Promise<void> {
        await this.neighborhoodUserService.removeMemberFromNeighborhood(
            params.neighborhoodId,
            params.userId,
            req.user.id
        );
    }

    @Get(':neighborhoodId/manage-users')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Get all users in a neighborhood for management' })
    @ApiOkResponse({
        description: 'Users in the neighborhood for management',
        type: [ResponseMemberNeighborhoodDto],
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found or no users in the neighborhood',
    })
    async getManageUsersInNeighborhood(
        @Param('neighborhoodId') neighborhoodId: number,
        @Request() req: { user: { id: number } },
        @Query() query: QueryGetManageUser
    ): Promise<ResponseMemberNeighborhoodDto[]> {
        const users = await this.neighborhoodUserService.getManageUsersInNeighborhood(
            neighborhoodId,
            req.user.id,
            query.role,
            query.status
        );

        if (isNull(users) || users.length === 0) {
            return [];
        }

        return users;
    }

    @Get(':neighborhoodId/invitations')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Get all invitations for a neighborhood' })
    @ApiOkResponse({
        description: 'Invitations found for the neighborhood',
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found or no invitations found',
    })
    async getInvitationsByNeighborhoodId(
        @Param('neighborhoodId') neighborhoodId: number
    ): Promise<NeighborhoodInvitation[]> {
        return this.neighborhoodInvitationService.getInvitationsByNeighborhoodId(neighborhoodId);
    }

    @Delete('invitations/:invitationId')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Delete a neighborhood invitation' })
    @ApiOkResponse({ description: 'Invitation deleted' })
    @ApiNotFoundResponse({ description: 'Invitation not found' })
    async deleteInvitation(
        @Param('invitationId') invitationId: number,
        @Request() req: { user: { id: number } }
    ): Promise<void> {
        await this.neighborhoodInvitationService.deleteInvitation(invitationId, req.user.id);
    }

    @Get(':neighborhoodId/recommandations')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Get users recommendations in a neighborhood for a user' })
    @ApiOkResponse({
        description: 'Users recommendations found for the user',
        type: [ResponseUserDto],
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Neighborhood not found or no invitations found',
    })
    async getRecommendationByUserAndNeighborhoodId(
        @Request()
        req: {
            user: { id: number };
        },
        @Param('neighborhoodId') neighborhoodId: number,
        @Query('limit') limit = 100
    ): Promise<ResponseUserDto[]> {
        const recommendations = await this.neo4jService.getRecommendationsByUserAndNeighborhood(
            req.user.id,
            neighborhoodId,
            limit
        );

        if (isNull(recommendations) || recommendations.length === 0) {
            return [];
        }

        recommendations.sort((a, b) => b.sharedLinks - a.sharedLinks);
        return await Promise.all(
            recommendations.map(async (rec) => {
                const user = await this.usersService.getUserById(rec.user.id);
                return UserAdapter.domainToResponseUser(user);
            })
        );
    }
}
