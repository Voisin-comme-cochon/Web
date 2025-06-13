import { ApiProperty } from '@nestjs/swagger';

export class JavaVersionDto {
    @ApiProperty({
        description: 'Identifiant unique de la version',
        example: 1
    })
    id!: number;

    @ApiProperty({
        description: 'Version de Java',
        example: '17.0.2'
    })
    version!: string;

    @ApiProperty({
        description: 'Nom du fichier de la version',
        example: 'jdk-17.0.2'
    })
    fileName!: string;

    @ApiProperty({
        description: 'Date d\'upload de la version',
        example: '2024-03-20T10:00:00Z'
    })
    uploadedAt!: Date;
}