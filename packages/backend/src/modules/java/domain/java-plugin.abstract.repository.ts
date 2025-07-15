import { JavaPlugin } from '../../../core/entities/java-plugin.entity';

export abstract class JavaPluginRepository {
    abstract getAllPlugins(): Promise<JavaPlugin[]>;
    abstract createPlugin(name: string, version: string, description: string, fileName: string): Promise<JavaPlugin>;
} 