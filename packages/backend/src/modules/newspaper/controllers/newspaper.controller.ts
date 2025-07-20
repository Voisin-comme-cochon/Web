import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { NewspaperService } from '../services/newspaper.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { CreateOrUpdateNewspaperDto } from './dto/newspaper.dto';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Newspaper')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
@Controller('newspaper')
export class NewspaperController {
  constructor(private readonly newspaperService: NewspaperService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un journal' })
  @ApiOkResponse({ description: 'Journal créé' })
  @ApiNotFoundResponse({ description: 'Erreur lors de la création du journal' })
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() body: CreateOrUpdateNewspaperDto,
    @UploadedFile() profileImage?: Express.Multer.File
  ) {
    // Parse content si string JSON
    if (typeof body.content === 'string') {
      try { body.content = JSON.parse(body.content); } catch {}
    }
    return this.newspaperService.create({ ...body, profileImage });
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les journaux' })
  @ApiOkResponse({ description: 'Liste des journaux' })
  @ApiNotFoundResponse({ description: 'Aucun journal trouvé' })
  async findAll() {
    return this.newspaperService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un journal par ID' })
  @ApiOkResponse({ description: 'Journal trouvé' })
  @ApiNotFoundResponse({ description: 'Journal non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.newspaperService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les journaux par utilisateur' })
  @ApiOkResponse({ description: 'Journaux trouvés pour cet utilisateur' })
  @ApiNotFoundResponse({ description: 'Aucun journal trouvé pour cet utilisateur' })
  async findByUser(@Param('userId') userId: string) {
    return this.newspaperService.findByUser(userId);
  }

  @Get('neighborhood/:neighborhoodId')
  @ApiOperation({ summary: 'Récupérer les journaux par quartier' })
  @ApiOkResponse({ description: 'Journaux trouvés pour ce quartier' })
  @ApiNotFoundResponse({ description: 'Aucun journal trouvé pour ce quartier' })
  async findByNeighborhood(@Param('neighborhoodId') neighborhoodId: string) {
    return this.newspaperService.findByNeighborhood(neighborhoodId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un journal' })
  @ApiOkResponse({ description: 'Journal mis à jour' })
  @ApiNotFoundResponse({ description: 'Journal à mettre à jour non trouvé' })
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateOrUpdateNewspaperDto>,
    @UploadedFile() profileImage?: Express.Multer.File
  ) {
    if (typeof body.content === 'string') {
      try { body.content = JSON.parse(body.content); } catch {}
    }
    return this.newspaperService.update(id, { ...body, profileImage });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un journal' })
  @ApiOkResponse({ description: 'Journal supprimé' })
  @ApiNotFoundResponse({ description: 'Journal à supprimer non trouvé' })
  async delete(@Param('id') id: string) {
    return this.newspaperService.delete(id);
  }
} 