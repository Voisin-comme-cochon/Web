import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsInt } from 'class-validator';

export class ResponseTagDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the tag',
    })
    @IsInt()
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
