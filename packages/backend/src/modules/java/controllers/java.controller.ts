import { Body, Controller, Get, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsLoginGuard } from 'src/middleware/is-login.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { JavaService } from '../services/java.service';
import { CreateJavaVersionDto, JavaDto } from '../adapters/java.adapter';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';

@ApiTags('Java')
@Controller('java')
export class JavaController {
    objectStorageService: any;
    constructor(private readonly javaService: JavaService) {}

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
}
