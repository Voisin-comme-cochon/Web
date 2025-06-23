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
}
