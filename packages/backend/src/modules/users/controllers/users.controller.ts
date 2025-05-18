import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsSuperAdminGuard } from 'src/middleware/is-super-admin.middleware';
import { UsersService } from '../services/users.service';
import { UserAdapter } from '../adapters/user.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { ResponseUserDto } from './dto/users.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({ summary: 'Get users' })
    @ApiOkResponse({ description: 'User found', type: ResponseUserDto })
    @ApiNotFoundResponse({ description: 'User not found' })
    @UseGuards(IsSuperAdminGuard)
    async getUsers(@Query() pagination: Paging): Promise<Paginated<ResponseUserDto>> {
        const [users, count] = await this.usersService.getUsers(pagination.page, pagination.limit);
        const responseUsers = UserAdapter.listDomainToResponseUser(users);
        return new Paginated(responseUsers, pagination, count);
    }
}
