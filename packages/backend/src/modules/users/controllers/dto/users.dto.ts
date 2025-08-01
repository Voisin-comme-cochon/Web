import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsPhoneNumber, IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Tag } from '../../../tags/domain/tags.model';

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

    @ApiProperty({ example: 48.8566, description: 'Latitude of the user location' })
    @IsNumber()
    latitude!: number;

    @ApiProperty({ example: 2.3522, description: 'Longitude of the user location' })
    @IsNumber()
    longitude!: number;

    @ApiProperty({
        example: 'description',
        description: 'The description number of the User',
    })
    @IsString()
    description?: string;

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

    @ApiProperty({
        example: 'https://example.com/profile-image.jpg',
        description: 'The profile image URL of the User',
    })
    @IsString()
    profileImageUrl?: string;

    @ApiProperty({
        example: [{ id: 1, name: 'Tag name' }],
        description: 'The tags associated with the User',
        required: false,
    })
    @IsArray()
    @IsOptional()
    tags?: Tag[];
}

export class GetUserByIdDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the User to retrieve',
    })
    @IsInt()
    @Type(() => Number)
    id!: number;
}
