import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';
import { Geography } from 'typeorm';
import { NeighborhoodStatusEntity } from '../../../../core/entities/neighborhood-status.entity';
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

    @ApiProperty({
        example: ['user1@example.com', 'user2@example.com'],
        description: 'List of emails to invite to the Neighborhood',
        required: false,
        isArray: true,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    inviteEmails?: string[];
}

export class GetNeighborhoodQueryParamsDto {
    @ApiProperty({
        example: 'waiting',
        description: 'The status of the Neighborhood',
    })
    @IsOptional()
    @IsEnum(NeighborhoodStatusEntity)
    status?: NeighborhoodStatusEntity;
}
