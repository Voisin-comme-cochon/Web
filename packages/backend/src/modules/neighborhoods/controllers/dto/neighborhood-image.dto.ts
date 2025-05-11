import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class ResponseNeighborhoodImageDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the Neighborhood Image',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        example: 'https://neighborhood-images.s3.amazonaws.com/image.jpg',
        description: 'The URL of the Neighborhood Image',
    })
    @IsString()
    url!: string;

    @ApiProperty({
        example: true,
        description: 'Whether this is the primary image for the neighborhood',
    })
    @IsBoolean()
    isPrimary!: boolean;

    @ApiProperty({
        example: 1,
        description: 'The id of the Neighborhood this image belongs to',
    })
    @IsInt()
    neighborhoodId!: number;
}
