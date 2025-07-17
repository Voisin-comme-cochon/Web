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

    async getPluginById(id: number): Promise<JavaPlugin | null> {
        return await this.dataSource.getRepository(JavaPlugin).findOneBy({ id });
    }

    async updatePlugin(id: number, data: Partial<JavaPlugin>): Promise<JavaPlugin> {
        const repo = this.dataSource.getRepository(JavaPlugin);
        await repo.update(id, data);
        const updated = await repo.findOneBy({ id });
        if (!updated) throw new Error('Plugin not found');
        return updated;
    }

    async deletePlugin(id: number): Promise<void> {
        await this.dataSource.getRepository(JavaPlugin).delete(id);
    }
} 