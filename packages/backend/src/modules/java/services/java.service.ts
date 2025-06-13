import { Injectable } from '@nestjs/common';
import { JavaRepository } from '../domain/java.abstract.repository';
import { JavaDto } from '../dto/java-version.dto';

@Injectable()
export class JavaService {
    constructor(private readonly javaRepository: JavaRepository) {}

    public async getCurrentVersion(): Promise<JavaDto> {
        const version = await this.javaRepository.getLastVersion();
        return {
            id: version.id,
            version: version.version,
            fileName: version.fileName,
            uploadedAt: version.uploadedAt
        };
    }
}
