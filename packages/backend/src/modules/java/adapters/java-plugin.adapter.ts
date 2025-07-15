import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class JavaPluginDto {
    @ApiProperty({
        description: 'Identifiant unique du plugin',
        example: 1,
    })
    @IsNumber()
    id!: number;

    @ApiProperty({
        description: 'Nom du plugin',
        example: 'Plugin de notification',
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        description: 'Version du plugin',
        example: '1.0.2',
    })
    @IsString()
    @IsNotEmpty()
    version!: string;

    @ApiProperty({
        description: 'Description du plugin',
        example: 'Plugin pour gérer les notifications push',
    })
    @IsString()
    @IsNotEmpty()
    description!: string;

    @ApiProperty({
        description: 'Nom du fichier du plugin',
        example: 'notification-plugin-v1.0.2.jar',
    })
    @IsString()
    @IsNotEmpty()
    fileName!: string;

    @ApiProperty({
        description: "Date d'upload du plugin",
        example: '2024-03-20T10:00:00Z',
    })
    @IsDate()
    uploadedAt!: Date;

    @ApiProperty({
        description: 'URL du fichier jar du plugin',
        example: 'https://minio.example.com/java-plugins/1234567890-plugin.jar',
    })
    @IsString()
    @IsNotEmpty()
    fileUrl!: string;
}

export class CreateJavaPluginDto {
    @ApiProperty({ example: 'Plugin de notification', description: 'Nom du plugin' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: '1.0.3', description: 'Version du plugin' })
    @IsString()
    @IsNotEmpty()
    version!: string;

    @ApiProperty({ example: 'Plugin pour gérer les notifications push', description: 'Description du plugin' })
    @IsString()
    @IsNotEmpty()
    description!: string;
} 