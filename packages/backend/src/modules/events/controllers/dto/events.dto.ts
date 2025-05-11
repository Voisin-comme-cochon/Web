import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNumber, IsString } from 'class-validator';
import { Geography } from 'typeorm';
import { TagEntity } from '../../../../core/entities/tag.entity';
import { ResponseUserDto } from '../../../users/controllers/dto/users.dto';
import { ResponseNeighborhoodDto } from '../../../neighborhoods/controllers/dto/neighborhood.dto';

export class ResponseEventDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the event',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        description: 'The creator of the event',
    })
    creator!: ResponseUserDto;

    @ApiProperty({
        example: 'Fremiot',
        description: 'The neighborhood of the event',
    })
    neighborhood!: ResponseNeighborhoodDto;

    @ApiProperty({
        example: 'Event 1',
        description: 'The name of the event',
    })
    @IsString()
    name!: string;

    @ApiProperty({
        example: 'description',
        description: 'The description of the event',
    })
    @IsString()
    description!: string;

    @ApiProperty({
        example: '19/12/2025',
        description: 'The creation date of the event',
    })
    @IsISO8601()
    createdAt!: Date;

    @ApiProperty({
        example: '19/12/2025 10:00:00',
        description: 'The start date of the event',
    })
    @IsISO8601()
    dateStart?: Date;

    @ApiProperty({
        example: '19/12/2025 10:00:00',
        description: 'The end date of the event',
    })
    @IsISO8601()
    dateEnd?: Date;

    @ApiProperty({
        description: 'The tag of the event',
    })
    tag!: TagEntity;

    @ApiProperty({
        example: '0',
        description: 'The minimum number of participants of the event',
    })
    @IsNumber()
    min!: number;

    @ApiProperty({
        example: '1',
        description: 'The maximum number of participants of the event',
    })
    @IsNumber()
    max!: number;

    @ApiProperty({
        example: 'link',
        description: 'The link of the picture of the event',
    })
    @IsString()
    photo!: string;

    @ApiProperty({
        example: 'object',
        description: 'The start address of the event',
    })
    addressStart!: Geography;

    @ApiProperty({
        example: 'object',
        description: 'The end address of the event',
    })
    addressEnd!: Geography;
}
