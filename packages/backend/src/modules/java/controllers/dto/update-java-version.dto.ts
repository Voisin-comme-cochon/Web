import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateJavaVersionDto } from './java-version.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateJavaVersionDto extends PartialType(CreateJavaVersionDto) {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    version?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fileName?: string;
} 