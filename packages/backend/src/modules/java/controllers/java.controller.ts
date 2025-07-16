import {
    Body,
    Controller,
    Get,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    BadRequestException,
    Put,
    Delete,
    Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsLoginGuard } from 'src/middleware/is-login.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { JavaService } from '../services/java.service';
import { JavaPluginService } from '../services/java-plugin.service';
import { CreateJavaVersionDto, JavaDto } from './dto/java-version.dto';
import { CreateJavaPluginDto, JavaPluginDto } from './dto/java-plugin.dto';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { UpdateJavaPluginDto } from './dto/update-java-plugin.dto';

@ApiTags('Java')
@Controller('java')
export class JavaController {
    constructor(
        private readonly javaService: JavaService,
        private readonly javaPluginService: JavaPluginService
    ) {}

    @Get('version')
    @ApiOperation({ summary: 'Récupérer la dernière version de Java' })
    @ApiResponse({
        status: 200,
        description: 'La dernière version de Java',
        type: JavaDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Aucune version Java trouvée',
    })
    public async getCurrentVersion(): Promise<JavaDto> {
        return await this.javaService.getCurrentVersion();
    }

    @Post('version')
    @UseGuards(IsLoginGuard, IsSuperAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Uploader un nouveau .jar de l'appli" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                version: { type: 'string', example: '1.0.7' },
                fileName: { type: 'string', example: 'Voisin Comme cochon scrapper v1.0.7' },
                jar: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('jar'))
    async uploadNewVersion(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateJavaVersionDto
    ): Promise<JavaDto> {
        if (!file.originalname.endsWith('.jar')) {
            throw new BadRequestException('Seuls les fichiers .jar sont autorisés');
        }
        return this.javaService.createVersion(body.version, body.fileName, file.buffer, file.originalname);
    }

    @Get('plugins')
    @ApiOperation({ summary: 'Récupérer tous les plugins Java' })
    @ApiResponse({
        status: 200,
        description: 'Liste de tous les plugins Java',
        type: [JavaPluginDto],
    })
    public async getAllPlugins(): Promise<JavaPluginDto[]> {
        return await this.javaPluginService.getAllPlugins();
    }

    @Post('plugins')
    @UseGuards(IsLoginGuard, IsSuperAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Uploader un nouveau plugin .jar' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Plugin de notification' },
                version: { type: 'string', example: '1.0.0' },
                description: { type: 'string', example: 'Plugin pour gérer les notifications push' },
                jar: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('jar'))
    async uploadNewPlugin(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateJavaPluginDto
    ): Promise<JavaPluginDto> {
        if (!file.originalname.endsWith('.jar')) {
            throw new BadRequestException('Seuls les fichiers .jar sont autorisés');
        }
        return this.javaPluginService.createPlugin(body.name, body.version, body.description, file.buffer, file.originalname);
    }

    @Get('plugins/:id')
    @ApiOperation({ summary: 'Récupérer un plugin Java par id' })
    @ApiResponse({ status: 200, type: JavaPluginDto })
    @ApiResponse({ status: 404, description: 'Plugin non trouvé' })
    public async getPluginById(@Param('id') id: number): Promise<JavaPluginDto> {
        const plugin = await this.javaPluginService.getPluginById(Number(id));
        if (!plugin) throw new BadRequestException('Plugin non trouvé');
        return plugin;
    }

    @Put('plugins/:id')
    @UseGuards(IsLoginGuard, IsSuperAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mettre à jour un plugin Java' })
    @ApiBody({ type: UpdateJavaPluginDto })
    public async updatePlugin(
        @Param('id') id: number,
        @Body() body: UpdateJavaPluginDto
    ): Promise<JavaPluginDto> {
        return this.javaPluginService.updatePlugin(Number(id), body);
    }

    @Delete('plugins/:id')
    @UseGuards(IsLoginGuard, IsSuperAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Supprimer un plugin Java' })
    public async deletePlugin(@Param('id') id: number): Promise<void> {
        await this.javaPluginService.deletePlugin(Number(id));
    }
}
