import { Controller, Get, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetUserByIdParams, UserDto } from './models/users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(':id')
    @ApiOperation({ summary: 'Get user by id' })
    @ApiOkResponse({ description: 'User found', type: UserDto })
    @ApiBadRequestResponse({ description: 'Request param is not valid' })
    @ApiNotFoundResponse({ description: 'User not found' })
    getUserById(@Param() params: GetUserByIdParams): UserDto {
        return this.usersService.getById(params.id);
    }
}
