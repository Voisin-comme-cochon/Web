import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Tag } from '../../../tags/domain/tags.model';

export class ResponseGroupDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the group',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        description: 'The name of the group',
    })
    @IsString()
    name!: string;

    @ApiProperty({
        example: 'object',
        description: 'The tag of the group',
    })
    tag!: Tag;

    @ApiProperty({
        example: true,
        description: 'The privacy of the group',
    })
    isPrivate!: boolean;

    @ApiProperty({
        description: 'The description of the group',
    })
    @IsString()
    description!: string;
}

export class GetObjectByIdDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the object',
    })
    @Type(() => Number)
    @IsInt()
    id!: number;
}
