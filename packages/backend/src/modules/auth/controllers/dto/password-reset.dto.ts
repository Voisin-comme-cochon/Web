import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestPasswordResetDto {
    @ApiProperty({ example: 'email@email.com', description: 'Email of the user' })
    @IsEmail()
    email!: string;
}

export class ResetPasswordDto {
    @ApiProperty({ example: 'token', description: 'Password reset token' })
    @IsString()
    token!: string;

    @ApiProperty({
        example: 'newPassword',
        description: 'New password of the user',
    })
    @Type(() => String)
    @MinLength(8)
    password!: string;
}

export class PasswordResetResponseDto {
    @ApiProperty({
        example: 'Password reset email sent',
        description: 'Message indicating the result of the operation',
    })
    @IsString()
    message!: string;
}
