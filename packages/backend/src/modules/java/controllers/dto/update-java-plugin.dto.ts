import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateJavaPluginDto } from './java-plugin.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateJavaPluginDto extends PartialType(CreateJavaPluginDto) {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    version?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fileName?: string;
} 