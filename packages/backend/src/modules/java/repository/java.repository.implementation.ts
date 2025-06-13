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
            .findOne({
                order: {
                    uploadedAt: 'DESC'
                }
            });

        if (!version) {
            throw new NotFoundException('Aucune version Java trouvée');
        }

        return version;
    }
}
