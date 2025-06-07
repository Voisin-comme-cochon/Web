import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, ArrayMinSize } from 'class-validator';

export class AssignTagToUserDto {
    @ApiProperty({
        example: [1, 2, 3],
        description: 'Array of tag IDs to assign to the user',
        type: [Number],
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    tagIdIn!: number[];
}

export class RemoveTagFromUserDto {
    @ApiProperty({
        example: [1, 2, 3],
        description: 'Array of tag IDs to remove from the user',
        type: [Number],
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    tagIdIn!: number[];
}

export class UserTagResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the user-tag association',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        example: 1,
        description: 'The user id',
    })
    @IsInt()
    userId!: number;

    @ApiProperty({
        example: 1,
        description: 'The tag id',
    })
    @IsInt()
    tagId!: number;

    @ApiProperty({
        example: '2023-01-01T00:00:00.000Z',
        description: 'When the tag was assigned to the user',
    })
    assignedAt!: Date;
}
