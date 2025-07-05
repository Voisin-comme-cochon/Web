import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemAvailabilityStatus } from '../../../../core/entities/item-availability.entity';

export class CreateItemDto {
    @ApiProperty({ example: 'Perceuse', description: 'Name of the item' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'Perceuse sans fil 18V', description: 'Description of the item', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'outils', description: 'Category of the item', required: false })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ 
        type: 'string', 
        format: 'binary', 
        description: 'Item image file', 
        required: false 
    })
    image?: Express.Multer.File;

    @ApiProperty({ example: 1, description: 'Neighborhood ID' })
    @IsInt()
    @Type(() => Number)
    neighborhood_id!: number;
}

export class UpdateItemDto {
    @ApiProperty({ example: 'Perceuse', description: 'Name of the item', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Perceuse sans fil 18V', description: 'Description of the item', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'outils', description: 'Category of the item', required: false })
    @IsString()
    @IsOptional()
    category?: string;
}

export class CreateItemAvailabilityDto {
    @ApiProperty({ example: '2024-01-15', description: 'Start date of availability' })
    @IsDateString()
    start_date!: string;

    @ApiProperty({ example: '2024-01-30', description: 'End date of availability' })
    @IsDateString()
    end_date!: string;
}

export class UpdateItemAvailabilityDto {
    @ApiProperty({ example: '2024-01-15', description: 'Start date of availability', required: false })
    @IsDateString()
    @IsOptional()
    start_date?: string;

    @ApiProperty({ example: '2024-01-30', description: 'End date of availability', required: false })
    @IsDateString()
    @IsOptional()
    end_date?: string;

    @ApiProperty({
        example: 'available',
        description: 'Status of availability',
        enum: ItemAvailabilityStatus,
        required: false,
    })
    @IsEnum(ItemAvailabilityStatus)
    @IsOptional()
    status?: ItemAvailabilityStatus;
}

export class GetItemsQueryDto {
    @ApiProperty({ example: 1, description: 'Neighborhood ID' })
    @IsInt()
    @Type(() => Number)
    neighborhoodId!: number;

    @ApiProperty({ example: 'perceuse', description: 'Search term for item name or description', required: false })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({ example: 'Outils', description: 'Filter by category', required: false })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ 
        example: 'available', 
        description: 'Filter by availability status', 
        enum: ItemAvailabilityStatus,
        required: false 
    })
    @IsEnum(ItemAvailabilityStatus)
    @IsOptional()
    status?: ItemAvailabilityStatus;
}

export class GetItemByIdDto {
    @ApiProperty({ example: 1, description: 'Item ID' })
    @IsInt()
    @Type(() => Number)
    id!: number;
}

export class ResponseItemDto {
    @ApiProperty({ example: 1, description: 'Item ID' })
    id!: number;

    @ApiProperty({ example: 'Perceuse', description: 'Name of the item' })
    name!: string;

    @ApiProperty({ example: 'Perceuse sans fil 18V', description: 'Description of the item' })
    description?: string;

    @ApiProperty({ example: 'outils', description: 'Category of the item' })
    category?: string;

    @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL' })
    image_url?: string;

    @ApiProperty({ example: 1, description: 'Owner ID' })
    owner_id!: number;

    @ApiProperty({ example: 1, description: 'Neighborhood ID' })
    neighborhood_id!: number;

    @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Creation date' })
    created_at!: Date;
}

export class ResponseItemAvailabilityDto {
    @ApiProperty({ example: 1, description: 'Availability ID' })
    id!: number;

    @ApiProperty({ example: 1, description: 'Item ID' })
    item_id!: number;

    @ApiProperty({ example: '2024-01-15', description: 'Start date' })
    start_date!: Date;

    @ApiProperty({ example: '2024-01-30', description: 'End date' })
    end_date!: Date;

    @ApiProperty({ example: 'available', description: 'Status', enum: ItemAvailabilityStatus })
    status!: ItemAvailabilityStatus;

    @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Creation date' })
    created_at!: Date;
}
