import { Controller, Get } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserAdapter } from '../adapters/user.adapter';
import { ResponseUserDto } from './dto/users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Get users' })
    @ApiOkResponse({ description: 'User found', type: ResponseUserDto })
    @ApiNotFoundResponse({ description: 'User not found' })
    async getUserById(): Promise<ResponseUserDto[]> {
        const users = await this.usersService.getUsers();
        return UserAdapter.listDomainToResponseUser(users);
    }
}
