import { JavaVersion } from '../../../core/entities/java.entity';

export abstract class JavaRepository {
    abstract getLastVersion(): Promise<JavaVersion>;
    abstract getAllVersions(): Promise<JavaVersion[]>;
    abstract getVersionById(id: number): Promise<JavaVersion | null>;
    abstract updateVersion(id: number, data: Partial<JavaVersion>): Promise<JavaVersion>;
    abstract deleteVersion(id: number): Promise<void>;
    abstract createVersion(version: string, fileName: string): Promise<JavaVersion>;
}
