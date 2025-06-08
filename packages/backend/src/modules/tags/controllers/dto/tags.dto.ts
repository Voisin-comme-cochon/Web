import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { IsHexColor, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class TagDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the tag',
    })
    @IsInt()
    @Type(() => Number)
    id!: number;

    @ApiProperty({
        description: 'The name of the tag',
    })
    name!: string;

    @ApiProperty({
        example: '#FF5733',
        description: 'The color of the tag',
    })
    @IsHexColor()
    color!: string;
}

export class UpsertTagDto extends OmitType(TagDto, ['id']) {}

export class GetByIdDto extends PickType(TagDto, ['id']) {}
