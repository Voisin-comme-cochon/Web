import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { Templates } from '../../domain/templates.enum';

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

    @ApiProperty({ description: 'Template name', required: false, enum: Templates })
    @IsEnum(Templates)
    @IsOptional()
    template?: Templates;

    @ApiProperty({
        description: 'Context data for template',
        required: false,
        example: {
            name: 'John Doe',
            resetLink: 'https://example.com/reset-password',
        },
    })
    @IsOptional()
    @IsObject()
    context?: Record<string, unknown>;
}
