import { JavaVersion } from '../../../core/entities/java.entity';

export abstract class JavaRepository {
    abstract getLastVersion(): Promise<JavaVersion>;
    abstract createVersion(version: string, fileName: string): Promise<JavaVersion>;
}
