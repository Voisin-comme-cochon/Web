import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';
import { Geography } from 'typeorm';
import { NeighborhoodStatusEntity } from '../../../../core/entities/neighborhood-status.entity';
import { NeighborhoodUserRole, NeighborhoodUserStatus } from '../../../../core/entities/neighborhood-user.entity';
import { ResponseNeighborhoodImageDto } from './neighborhood-image.dto';

export class ResponseNeighborhoodDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the Neighborhood',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        example: 'Quartier des Lilas',
        description: 'The name of the Neighborhood',
    })
    @IsString()
    name!: string;

    @ApiProperty({
        example: 'waiting',
        description: 'The status of the Neighborhood',
    })
    @IsEnum(NeighborhoodStatusEntity)
    status!: NeighborhoodStatusEntity;

    @ApiProperty({
        example: 'Quartier des Lilas de la ville de Villeurbanne',
        description: 'The description of the Neighborhood',
    })
    @IsString()
    description!: string;

    @ApiProperty({
        example: '15/04/2025 12:00:00',
        description: 'The creation date of the Neighborhood',
    })
    @IsISO8601()
    creationDate!: Date;

    @ApiProperty({
        example: 'object',
        description: 'The geography informations of the Neighborhood',
    })
    geo!: Geography;

    @ApiProperty({
        type: [ResponseNeighborhoodImageDto],
        description: 'The images of the Neighborhood',
        required: false,
    })
    @IsOptional()
    images?: ResponseNeighborhoodImageDto[];
}

export class RequestNeighborhoodDto {
    @ApiProperty({
        example: 'Quartier des Lilas',
        description: 'The name of the Neighborhood',
    })
    @IsString()
    name!: string;

    @ApiProperty({
        example: 'Quartier des Lilas de la ville de Villeurbanne',
        description: 'The description of the Neighborhood',
    })
    @IsString()
    description!: string;

    @ApiProperty({
        example: 'string',
        description: 'The geography informations of the Neighborhood',
    })
    geo!: string;
}

export class RequestUpdateNeighborhoodDto {
    @ApiProperty({
        example: 'Quartier des Lilas',
        description: 'The name of the Neighborhood',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: 'Quartier des Lilas de la ville de Villeurbanne',
        description: 'The description of the Neighborhood',
    })
    @IsString()
    @IsOptional()
    description?: string;
}

export class GetNeighborhoodQueryParamsDto {
    @ApiProperty({
        example: 'waiting',
        description: 'The status of the Neighborhood',
    })
    @IsOptional()
    @IsEnum(NeighborhoodStatusEntity)
    status?: NeighborhoodStatusEntity;

    @ApiProperty({
        example: '1.2',
        description: "Longitude of the Neighborhood's location",
    })
    @IsOptional()
    @IsString()
    lng?: string;

    @ApiProperty({
        example: '3.4',
        description: "Latitude of the Neighborhood's location",
    })
    @IsOptional()
    @IsString()
    lat?: string;
}

export class SetStatusNeighborhoodDto {
    @ApiProperty({
        example: 'accepted',
        description: 'The status of the Neighborhood',
    })
    @IsEnum(NeighborhoodStatusEntity)
    status!: NeighborhoodStatusEntity;
}

export class UpdateNeighborhoodUserDto {
    @ApiProperty({
        example: 'admin',
        description: "Le rôle de l'utilisateur dans le quartier",
        required: false,
    })
    @IsOptional()
    @IsEnum(NeighborhoodUserRole)
    role?: NeighborhoodUserRole;

    @ApiProperty({
        example: 'active',
        description: "Le statut de l'utilisateur dans le quartier",
        required: false,
    })
    @IsOptional()
    @IsEnum(NeighborhoodUserStatus)
    status?: NeighborhoodUserStatus;
}

export class ResponseMemberNeighborhoodDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the Neighborhood',
    })
    @IsInt()
    neighborhoodId!: number;

    @ApiProperty({
        example: 1,
        description: 'The id of the User',
    })
    @IsInt()
    userId!: number;

    @ApiProperty({
        example: 'John',
        description: 'Lastname of the User',
    })
    @IsString()
    lastName!: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Firstname of the User',
    })
    @IsString()
    firstName!: string;

    @ApiProperty({
        example: 'admin',
        description: "Le rôle de l'utilisateur dans le quartier",
    })
    @IsEnum(NeighborhoodUserRole)
    neighborhoodRole!: NeighborhoodUserRole;

    @ApiProperty({
        example: 'active',
        description: "Le statut de l'utilisateur dans le quartier",
    })
    @IsEnum(NeighborhoodUserStatus)
    status!: NeighborhoodUserStatus;
}

export class QueryGetManageUser {
    @ApiProperty({
        example: 'admin',
        description: "Le rôle de l'utilisateur à gérer",
        required: false,
    })
    @IsOptional()
    @IsEnum(NeighborhoodUserRole)
    role?: NeighborhoodUserRole;

    @ApiProperty({
        example: 'active',
        description: "Le statut de l'utilisateur à gérer",
        required: false,
    })
    @IsOptional()
    @IsEnum(NeighborhoodUserStatus)
    status?: NeighborhoodUserStatus;
}
