import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JavaPlugin } from '../../../core/entities/java-plugin.entity';
import { JavaPluginRepository } from '../domain/java-plugin.abstract.repository';

@Injectable()
export class JavaPluginRepositoryImplementation implements JavaPluginRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getAllPlugins(): Promise<JavaPlugin[]> {
        return await this.dataSource
            .getRepository(JavaPlugin)
            .createQueryBuilder('plugin')
            .orderBy('plugin.uploadedAt', 'DESC')
            .getMany();
    }

    async createPlugin(name: string, version: string, description: string, fileName: string): Promise<JavaPlugin> {
        const repo = this.dataSource.getRepository(JavaPlugin);
        const javaPlugin = repo.create({ name, version, description, fileName });
        await repo.save(javaPlugin);
        return javaPlugin;
    }
} 