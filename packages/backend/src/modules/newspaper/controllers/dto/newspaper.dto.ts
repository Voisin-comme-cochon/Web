import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrUpdateNewspaperDto {
  @ApiProperty({ example: 1, description: "ID de l'utilisateur" })
  @Type(() => Number)
  @IsNumber()
  userId!: number;

  @ApiProperty({ example: 1, description: "ID du quartier" })
  @Type(() => Number)
  @IsNumber()
  neighborhoodId!: number;

  @ApiProperty({ example: { text: 'Contenu du journal', images: ['img1.jpg'] }, description: 'Contenu du journal (texte, images, etc.)' })
  content!: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Fichier image de profil (upload)',
    required: false,
  })
  @IsOptional()
  profileImage?: Express.Multer.File;

  @ApiPropertyOptional({ example: 'Titre du journal', description: 'Titre du journal' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID du tag associé' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tagId?: number;
} 