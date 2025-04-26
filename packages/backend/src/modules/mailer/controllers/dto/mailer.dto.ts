import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class SendRawEmailDto {
    @ApiProperty({ description: 'Email recipient(s)', example: 'user@example.com' })
    @IsEmail({}, { each: true })
    @IsArray()
    to!: string[];

    @ApiProperty({ description: 'Email subject', example: 'Welcome to the platform' })
    @IsString()
    subject!: string;

    @ApiProperty({ description: 'Email text content', required: false })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiProperty({ description: 'Email HTML content', required: false })
    @IsString()
    @IsOptional()
    html?: string;

    @ApiProperty({ description: 'Email template name', required: false })
    @IsString()
    @IsOptional()
    template?: string;

    @ApiProperty({ description: 'Context data for template', required: false })
    @IsOptional()
    context?: Record<string, never>;
}
