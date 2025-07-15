import { Injectable } from '@nestjs/common';
import { JavaPluginRepository } from '../domain/java-plugin.abstract.repository';
import { JavaPluginDto } from '../adapters/java-plugin.adapter';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';

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
} 