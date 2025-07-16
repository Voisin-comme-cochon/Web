import { JavaPlugin } from '../../../core/entities/java-plugin.entity';

export abstract class JavaPluginRepository {
    abstract getAllPlugins(): Promise<JavaPlugin[]>;
    abstract getPluginById(id: number): Promise<JavaPlugin | null>;
    abstract updatePlugin(id: number, data: Partial<JavaPlugin>): Promise<JavaPlugin>;
    abstract deletePlugin(id: number): Promise<void>;
    abstract createPlugin(name: string, version: string, description: string, fileName: string): Promise<JavaPlugin>;
} 