import { ApiProperty } from '@nestjs/swagger';
import {IsBoolean, IsEmail, IsInt, IsPhoneNumber, IsString, MinLength} from 'class-validator';
import {Type} from "class-transformer";

export class LogInSignInDto {
    @ApiProperty({ example: "email@email.com", description: 'Email of the user' })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'password',
        description: 'Password of the user',
    })
    @Type(() => String)
    @MinLength(8)
    password!: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: "jwt", description: 'Refresh token of the user' })
    @IsString()
    refreshToken!: number;
}

export class LogInSignInDtoOutput {
    @ApiProperty({
        example: 'jwt',
        description: 'The jwt token'
    })
    @IsString()
    access_token!: string;

    @ApiProperty({
        example: 'jwt',
        description: 'The jwt token'
    })
    @IsString()
    refresh_token!: string;
}

export class ResponseUserDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the User',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        example: 'Mathis',
        description: 'The firstname of the User',
    })
    @IsString()
    firstName!: string;

    @ApiProperty({
        example: 'Fremiot',
        description: 'The lastname of the User',
    })
    @IsString()
    lastName!: string;

    @ApiProperty({
        example: 'name@gmail.com',
        description: 'The email of the User',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: '0123456789',
        description: 'The phone number of the User',
    })
    @IsPhoneNumber()
    phone!: string;

    @ApiProperty({
        example: '0123456789',
        description: 'The address number of the User',
    })
    @IsString()
    address!: string;

    @ApiProperty({
        example: 'description',
        description: 'The description number of the User',
    })
    @IsString()
    description!: string;

    @ApiProperty({
        example: 'true',
        description: 'If User is super admin',
    })
    @IsBoolean()
    isSuperAdmin!: boolean;

    @ApiProperty({
        example: 'true',
        description: 'If User is register to the newsletter',
    })
    @IsBoolean()
    newsletter!: boolean;

    @ApiProperty({
        example: 'Mobile',
        description: 'The preffered notification method of the User',
    })
    @IsBoolean()
    prefferedNotifMethod!: string;

}
