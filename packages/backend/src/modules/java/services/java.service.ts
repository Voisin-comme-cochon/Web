import { Injectable } from '@nestjs/common';
import { JavaRepository } from '../domain/java.abstract.repository';
import { JavaDto } from '../adapters/java.adapter';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';

@Injectable()
export class JavaService {
    constructor(
        private readonly javaRepository: JavaRepository,
        private readonly objectStorageService: ObjectStorageService
    ) {}

    public async getCurrentVersion(): Promise<JavaDto> {
        const version = await this.javaRepository.getLastVersion();
        const fileUrl = await this.objectStorageService.getFileLink(version.fileName, BucketType.JAVA_VERSION);
        return {
            id: version.id,
            version: version.version,
            fileName: version.fileName,
            fileUrl: fileUrl,
            uploadedAt: version.uploadedAt
        };
    }

    public async createVersion(version: string, fileName: string, fileBuffer: Buffer, originalName: string): Promise<JavaDto> {
        const fileKey = await this.objectStorageService.uploadFile(fileBuffer, originalName, BucketType.JAVA_VERSION);
        const javaVersion = await this.javaRepository.createVersion(version, fileKey);
        return {
            id: javaVersion.id,
            version: javaVersion.version,
            fileName: javaVersion.fileName,
            fileUrl: await this.objectStorageService.getFileLink(fileKey, BucketType.JAVA_VERSION),
            uploadedAt: javaVersion.uploadedAt
        };
    }
}
