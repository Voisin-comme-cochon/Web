import { ApiProperty } from '@nestjs/swagger';

import { IsDate, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class JavaDto {

    @ApiProperty({
        description: 'Identifiant unique de la version',
        example: 1
    })
    @IsNumber()
    id!: number;


    @ApiProperty({
        description: 'Version du jar',
        example: '1.0.2'
    })
    @IsString()
    @IsNotEmpty()
    version!: string;

    @ApiProperty({
        description: 'Nom du fichier de la version',
        example: 'Voisin Comme cochon scrapper v1'
    })
    @IsString()
    @IsNotEmpty()
    fileName!: string;

    @ApiProperty({
        description: 'Date d\'upload de la version',
        example: '2024-03-20T10:00:00Z'
    })
    @IsDate()
    uploadedAt!: Date;

    @ApiProperty({
        description: 'URL du fichier jar',
        example: 'https://minio.example.com/java-version/1234567890-app.jar'
    })
    @IsString()
    @IsNotEmpty()
    fileUrl!: string;
}



export class CreateJavaVersionDto {
    @ApiProperty({ example: '1.0.3', description: 'Version du jar' })
    @IsString()
    @IsNotEmpty()
    version!: string;

    @ApiProperty({ example: 'Voisin Comme cochon scrapper v1.0.3', description: 'Nom du fichier' })
    @IsString()
    @IsNotEmpty()
    fileName!: string;
}
