import { Controller, Get, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserAdapter } from '../adapters/user.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { ResponseUserDto } from './dto/users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Get users' })
    @ApiOkResponse({ description: 'User found', type: ResponseUserDto })
    @ApiNotFoundResponse({ description: 'User not found' })
    async getUsers(@Query() pagination: Paging): Promise<Paginated<ResponseUserDto>> {
        const [users, count] = await this.usersService.getUsers(pagination.page, pagination.limit);
        const responseUsers = UserAdapter.listDomainToResponseUser(users);
        return new Paginated(responseUsers, pagination, count);
    }
}
