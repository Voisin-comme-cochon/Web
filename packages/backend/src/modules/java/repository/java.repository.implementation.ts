import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JavaVersion } from '../../../core/entities/java.entity';
import { JavaRepository } from '../domain/java.abstract.repository';

@Injectable()
export class JavaRepositoryImplementation implements JavaRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getLastVersion(): Promise<JavaVersion> {
        const version = await this.dataSource
            .getRepository(JavaVersion)
            .createQueryBuilder('version')
            .orderBy('version.uploadedAt', 'DESC')
            .getOne();

        if (!version) {
            throw new NotFoundException('Aucune version Java trouvée');
        }
        return version;
    }

    async createVersion(version: string, fileName: string): Promise<JavaVersion> {
        const repo = this.dataSource.getRepository(JavaVersion);
        const javaVersion = repo.create({ version, fileName });
        await repo.save(javaVersion);
        return javaVersion;
    }

    async getAllVersions(): Promise<JavaVersion[]> {
        return await this.dataSource
            .getRepository(JavaVersion)
            .createQueryBuilder('version')
            .orderBy('version.uploadedAt', 'DESC')
            .getMany();
    }

    async getVersionById(id: number): Promise<JavaVersion | null> {
        return await this.dataSource.getRepository(JavaVersion).findOneBy({ id });
    }

    async updateVersion(id: number, data: Partial<JavaVersion>): Promise<JavaVersion> {
        const repo = this.dataSource.getRepository(JavaVersion);
        await repo.update(id, data);
        const updated = await repo.findOneBy({ id });
        if (!updated) throw new Error('Version not found');
        return updated;
    }

    async deleteVersion(id: number): Promise<void> {
        await this.dataSource.getRepository(JavaVersion).delete(id);
    }
}
