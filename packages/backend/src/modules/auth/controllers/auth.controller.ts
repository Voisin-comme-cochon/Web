import { Body, Controller, Delete, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../services/auth.service';
import { LoginInDto, LogInSignInDtoOutput, RefreshTokenDto, SignInDto } from './dto/auth.dto';
import { PasswordResetResponseDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signin')
    @ApiOperation({ summary: 'Sign in' })
    @ApiOkResponse({ description: 'Sign in successful', type: LogInSignInDtoOutput })
    @ApiNotFoundResponse({ description: 'Sign in failed' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('profileImage'))
    async signIn(
        @Body() body: SignInDto,
        @UploadedFile() profileImage?: Express.Multer.File
    ): Promise<LogInSignInDtoOutput> {
        return await this.authService.signIn({
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            email: body.email,
            address: body.address,
            latitude: body.latitude,
            longitude: body.longitude,
            password: body.password,
            description: body.description,
            profileImage: profileImage,
            tagIds: body.tagIds,
        });
    }

    @Post('login')
    @ApiOperation({ summary: 'Log in' })
    @ApiOkResponse({ description: 'Log in successful', type: LogInSignInDtoOutput })
    @ApiBadRequestResponse({ description: 'Log in failed' })
    async login(@Body() body: LoginInDto): Promise<LogInSignInDtoOutput> {
        return await this.authService.logIn(body.email, body.password);
    }

    @Delete('logout')
    @ApiOperation({ summary: 'Log out' })
    @ApiOkResponse({ description: 'Log out successful' })
    @ApiNotFoundResponse({ description: 'Log out failed' })
    async logout(@Body() body: RefreshTokenDto): Promise<void> {
        await this.authService.logout(body.refreshToken);
    }

    @Patch('refresh')
    @ApiOperation({ summary: 'Refresh token' })
    @ApiOkResponse({ description: 'Refresh token successful', type: LogInSignInDtoOutput })
    @ApiNotFoundResponse({ description: 'Refresh token failed' })
    async refresh(@Body() body: RefreshTokenDto): Promise<LogInSignInDtoOutput> {
        return await this.authService.refresh(body.refreshToken);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiOkResponse({ description: 'Password reset email sent', type: PasswordResetResponseDto })
    async requestPasswordReset(@Body() body: RequestPasswordResetDto): Promise<PasswordResetResponseDto> {
        return await this.authService.requestPasswordReset(body.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiOkResponse({ description: 'Password reset successful', type: PasswordResetResponseDto })
    @ApiNotFoundResponse({ description: 'Password reset failed' })
    async resetPassword(@Body() body: ResetPasswordDto): Promise<PasswordResetResponseDto> {
        return await this.authService.resetPassword(body.token, body.password);
    }
}
