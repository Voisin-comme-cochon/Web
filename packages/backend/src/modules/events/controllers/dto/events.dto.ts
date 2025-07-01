import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNumber, IsString } from 'class-validator';
import { Geography } from 'typeorm';
import { Type } from 'class-transformer';
import { ResponseUserDto } from '../../../users/controllers/dto/users.dto';
import { ResponseNeighborhoodDto } from '../../../neighborhoods/controllers/dto/neighborhood.dto';
import { TagDto } from '../../../tags/controllers/dto/tags.dto';
import { EventType } from '../../domain/events.model';

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
        example: 'event',
        description: 'The type of the event',
        enum: EventType,
    })
    @IsString()
    type!: EventType;

    @ApiProperty({
        description: 'The tag of the event',
    })
    tag!: TagDto;

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
        example: '0',
        description: 'The number of participants of the event',
    })
    @IsNumber()
    registeredUsers!: number;

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

export class ResponseEventWithUsersDto {
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
        example: 'event',
        description: 'The type of the event',
        enum: EventType,
    })
    @IsString()
    type!: EventType;

    @ApiProperty({
        description: 'The tag of the event',
    })
    tag!: TagDto;

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
        example: '0',
        description: 'The number of participants of the event',
    })
    @IsNumber()
    registeredUsers!: ResponseUserDto[];

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

export class GetEventsByNeighborhoodIdDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the neighborhood',
        required: true,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    id!: number;
}

export class GetEventIdDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the event',
        required: true,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    id!: number;
}

export class CreateEventDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the neighborhood',
        required: true,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    neighborhoodId!: number;

    @ApiProperty({
        example: 'Event 1',
        description: 'The name of the event',
        required: true,
    })
    @IsString()
    name!: string;

    @ApiProperty({
        example: 'description',
        description: 'The description of the event',
        required: true,
    })
    @IsString()
    description!: string;

    @ApiProperty({
        example: '19/12/2025 10:00:00',
        description: 'The start date of the event',
        required: true,
    })
    @IsISO8601()
    dateStart!: Date;

    @ApiProperty({
        example: '19/12/2025 10:00:00',
        description: 'The end date of the event',
        required: true,
    })
    @IsISO8601()
    dateEnd!: Date;

    @ApiProperty({
        example: 0,
        description: 'The minimum number of participants of the event',
        required: true,
    })
    @Type(() => Number)
    @IsNumber()
    min!: number;

    @ApiProperty({
        example: 1,
        description: 'The maximum number of participants of the event',
        required: true,
    })
    @Type(() => Number)
    @IsNumber()
    max!: number;

    @ApiProperty({
        example: 'event',
        description: 'The type of the event',
        required: true,
        enum: EventType,
    })
    type!: EventType;

    @ApiProperty({
        example: 1,
        description: 'The id of the tag',
        required: true,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    tagId!: number;

    @ApiProperty({
        example: 'geometry',
        description: 'The adress start of the event',
    })
    addressStart?: string;

    @ApiProperty({
        example: 'geometry',
        description: 'The adress end of the event',
    })
    addressEnd?: string;
}
