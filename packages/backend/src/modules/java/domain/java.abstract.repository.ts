import { JavaVersion } from '../../../core/entities/java.entity';

export abstract class JavaRepository {
    abstract getLastVersion(): Promise<JavaVersion>;
}
