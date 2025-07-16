import { Injectable } from '@nestjs/common';
import { JavaPluginRepository } from '../domain/java-plugin.abstract.repository';
import { JavaPluginDto } from '../controllers/dto/java-plugin.dto';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class JavaPluginService {
    constructor(
        private readonly javaPluginRepository: JavaPluginRepository,
        private readonly objectStorageService: ObjectStorageService
    ) {}

    public async getAllPlugins(): Promise<JavaPluginDto[]> {
        const plugins = await this.javaPluginRepository.getAllPlugins();
        
        const pluginsWithUrls = await Promise.all(
            plugins.map(async (plugin) => {
                const fileUrl = await this.objectStorageService.getFileLink(plugin.fileName, BucketType.JAVA_PLUGINS);
                return {
                    id: plugin.id,
                    name: plugin.name,
                    version: plugin.version,
                    description: plugin.description,
                    fileName: plugin.fileName,
                    fileUrl: fileUrl,
                    uploadedAt: plugin.uploadedAt,
                };
            })
        );

        return pluginsWithUrls;
    }

    public async createPlugin(
        name: string,
        version: string,
        description: string,
        fileBuffer: Buffer,
        originalName: string
    ): Promise<JavaPluginDto> {
        const fileKey = await this.objectStorageService.uploadFile(fileBuffer, originalName, BucketType.JAVA_PLUGINS);
        const javaPlugin = await this.javaPluginRepository.createPlugin(name, version, description, fileKey);
        
        return {
            id: javaPlugin.id,
            name: javaPlugin.name,
            version: javaPlugin.version,
            description: javaPlugin.description,
            fileName: javaPlugin.fileName,
            fileUrl: await this.objectStorageService.getFileLink(fileKey, BucketType.JAVA_PLUGINS),
            uploadedAt: javaPlugin.uploadedAt,
        };
    }

    public async getPluginById(id: number): Promise<JavaPluginDto | null> {
        if (!id || isNaN(Number(id))) throw new BadRequestException('ID invalide');
        const plugin = await this.javaPluginRepository.getPluginById(id);
        if (!plugin) throw new NotFoundException('Plugin non trouvé');
        const fileUrl = await this.objectStorageService.getFileLink(plugin.fileName, BucketType.JAVA_PLUGINS);
        return {
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            description: plugin.description,
            fileName: plugin.fileName,
            fileUrl,
            uploadedAt: plugin.uploadedAt,
        };
    }

    public async updatePlugin(id: number, data: Partial<JavaPluginDto>): Promise<JavaPluginDto> {
        if (!id || isNaN(Number(id))) throw new BadRequestException('ID invalide');
        const exists = await this.javaPluginRepository.getPluginById(id);
        if (!exists) throw new NotFoundException('Plugin non trouvé');
        const updated = await this.javaPluginRepository.updatePlugin(id, data);
        const fileUrl = await this.objectStorageService.getFileLink(updated.fileName, BucketType.JAVA_PLUGINS);
        return {
            id: updated.id,
            name: updated.name,
            version: updated.version,
            description: updated.description,
            fileName: updated.fileName,
            fileUrl,
            uploadedAt: updated.uploadedAt,
        };
    }

    public async deletePlugin(id: number): Promise<void> {
        if (!id || isNaN(Number(id))) throw new BadRequestException('ID invalide');
        const plugin = await this.javaPluginRepository.getPluginById(id);
        if (!plugin) throw new NotFoundException('Plugin non trouvé');
        await this.objectStorageService.deleteFile(plugin.fileName, BucketType.JAVA_PLUGINS);
        await this.javaPluginRepository.deletePlugin(id);
    }
} 