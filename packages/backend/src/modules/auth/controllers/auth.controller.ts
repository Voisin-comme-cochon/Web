import { Body, Controller, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginInDto, LogInSignInDtoOutput, SignInDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signin')
    @ApiOperation({ summary: 'Sign in' })
    @ApiOkResponse({ description: 'Sign in successful', type: LogInSignInDtoOutput })
    @ApiNotFoundResponse({ description: 'Sign in failed' })
    async signIn(@Body() body: SignInDto): Promise<LogInSignInDtoOutput> {
        return await this.authService.signIn(
            body.firstName,
            body.lastName,
            body.phone,
            body.email,
            body.address,
            body.password,
            body.description
        );
    }

    @Post('login')
    @ApiOperation({ summary: 'Sign in' })
    @ApiOkResponse({ description: 'Sign in successful', type: LogInSignInDtoOutput })
    @ApiNotFoundResponse({ description: 'Sign in failed' })
    async login(@Body() body: LoginInDto): Promise<LogInSignInDtoOutput> {
        return await this.authService.logIn(body.email, body.password);
    }
}
