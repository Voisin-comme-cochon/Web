import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SignInDto {
    @ApiProperty({ example: 'John', description: 'First name of the user' })
    @IsString()
    firstName!: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
    @IsString()
    lastName!: string;

    @ApiProperty({ example: '+123456789', description: 'Phone number of the user' })
    @IsString()
    phone!: string;

    @ApiProperty({ example: 'email@email.com', description: 'Email of the user' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: '123 Main St', description: 'Address of the user' })
    @IsString()
    address!: string;

    @ApiProperty({ example: 48.8566, description: 'Latitude of the user location' })
    @IsNumber()
    @Type(() => Number)
    latitude!: number;

    @ApiProperty({ example: 2.3522, description: 'Longitude of the user location' })
    @IsNumber()
    @Type(() => Number)
    longitude!: number;

    @ApiProperty({ example: 'A short description about the user', description: 'Description of the user' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false, description: 'Profile image URL of the user' })
    @IsOptional()
    profileImageUrl?: string;

    @ApiProperty({
        example: 'password',
        description: 'Password of the user',
    })
    @Type(() => String)
    @MinLength(8)
    password!: string;

    @ApiProperty({
        example: '1,2,3',
        description: 'List of tag IDs',
    })
    @IsString()
    @MinLength(1)
    tagIds!: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: 'jwt', description: 'Refresh token of the user' })
    @IsString()
    refreshToken!: string;
}

export class LoginInDto {
    @ApiProperty({
        example: 'email',
        description: 'Email of the user',
    })
    email!: string;

    @ApiProperty({
        example: 'password',
        description: 'Password of the user',
    })
    @Type(() => String)
    @MinLength(1)
    password!: string;
}

export class LogInSignInDtoOutput {
    @ApiProperty({
        example: 'jwt',
        description: 'The jwt token',
    })
    @IsString()
    access_token!: string;

    @ApiProperty({
        example: 'jwt',
        description: 'The jwt token',
    })
    @IsString()
    refresh_token!: string;
}
