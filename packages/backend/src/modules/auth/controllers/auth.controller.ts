import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { LoginInDto, LogInSignInDtoOutput, RefreshTokenDto, SignInDto } from './dto/auth.dto';

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
    @ApiOperation({ summary: 'Log in' })
    @ApiOkResponse({ description: 'Log in successful', type: LogInSignInDtoOutput })
    @ApiNotFoundResponse({ description: 'Log in failed' })
    async login(@Body() body: LoginInDto): Promise<LogInSignInDtoOutput> {
        return await this.authService.logIn(body.email, body.password);
    }

    @Delete('logout')
    @ApiOperation({ summary: 'Log out' })
    @ApiOkResponse({ description: 'Log out successful', type: LogInSignInDtoOutput })
    @ApiNotFoundResponse({ description: 'Log out failed' })
    @UseGuards(IsLoginGuard)
    async logout(@Body() body: RefreshTokenDto): Promise<void> {
        await this.authService.logout(body.refreshToken);
    }
}
