import { Injectable } from '@nestjs/common';
import { JavaRepository } from '../domain/java.abstract.repository';
import { JavaDto } from '../controllers/dto/java-version.dto';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
            uploadedAt: version.uploadedAt,
        };
    }

    public async createVersion(
        version: string,
        fileName: string,
        fileBuffer: Buffer,
        originalName: string
    ): Promise<JavaDto> {
        const fileKey = await this.objectStorageService.uploadFile(fileBuffer, originalName, BucketType.JAVA_VERSION);
        const javaVersion = await this.javaRepository.createVersion(version, fileKey);
        return {
            id: javaVersion.id,
            version: javaVersion.version,
            fileName: javaVersion.fileName,
            fileUrl: await this.objectStorageService.getFileLink(fileKey, BucketType.JAVA_VERSION),
            uploadedAt: javaVersion.uploadedAt,
        };
    }

    public async getAllVersions(): Promise<JavaDto[]> {
        const versions = await this.javaRepository.getAllVersions();
        return Promise.all(
            versions.map(async (version) => {
                const fileUrl = await this.objectStorageService.getFileLink(version.fileName, BucketType.JAVA_VERSION);
                return {
                    id: version.id,
                    version: version.version,
                    fileName: version.fileName,
                    fileUrl,
                    uploadedAt: version.uploadedAt,
                };
            })
        );
    }

    public async getVersionById(id: number): Promise<JavaDto | null> {
        if (!id || isNaN(Number(id))) throw new BadRequestException('ID invalide');
        const version = await this.javaRepository.getVersionById(id);
        if (!version) throw new NotFoundException('Version non trouvée');
        const fileUrl = await this.objectStorageService.getFileLink(version.fileName, BucketType.JAVA_VERSION);
        return {
            id: version.id,
            version: version.version,
            fileName: version.fileName,
            fileUrl,
            uploadedAt: version.uploadedAt,
        };
    }

    public async updateVersion(id: number, data: Partial<JavaDto>): Promise<JavaDto> {
        if (!id || isNaN(Number(id))) throw new BadRequestException('ID invalide');
        const exists = await this.javaRepository.getVersionById(id);
        if (!exists) throw new NotFoundException('Version non trouvée');
        const updated = await this.javaRepository.updateVersion(id, data);
        const fileUrl = await this.objectStorageService.getFileLink(updated.fileName, BucketType.JAVA_VERSION);
        return {
            id: updated.id,
            version: updated.version,
            fileName: updated.fileName,
            fileUrl,
            uploadedAt: updated.uploadedAt,
        };
    }

    public async deleteVersion(id: number): Promise<void> {
        if (!id || isNaN(Number(id))) throw new BadRequestException('ID invalide');
        const version = await this.javaRepository.getVersionById(id);
        if (!version) throw new NotFoundException('Version non trouvée');
        await this.objectStorageService.deleteFile(version.fileName, BucketType.JAVA_VERSION);
        await this.javaRepository.deleteVersion(id);
    }
}
