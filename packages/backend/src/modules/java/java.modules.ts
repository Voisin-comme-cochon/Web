import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IsLoginGuard } from '../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../middleware/is-super-admin.middleware';
import { AuthModule } from '../auth/auth.module';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';
import { JavaRepository } from './domain/java.abstract.repository';
import { JavaPluginRepository } from './domain/java-plugin.abstract.repository';
import { JavaController } from './controllers/java.controller';
import { JavaService } from './services/java.service';
import { JavaPluginService } from './services/java-plugin.service';
import { JavaRepositoryImplementation } from './repository/java.repository.implementation';
import { JavaPluginRepositoryImplementation } from './repository/java-plugin.repository.implementation';

@Module({
    imports: [AuthModule, ObjectStorageModule],
    controllers: [JavaController],
    exports: [JavaRepository, JavaService, JavaPluginRepository, JavaPluginService],
    providers: [
        {
            provide: JavaRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new JavaRepositoryImplementation(dataSource),
        },
        {
            provide: JavaPluginRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new JavaPluginRepositoryImplementation(dataSource),
        },
        {
            provide: JavaService,
            inject: [JavaRepository, ObjectStorageService],
            useFactory: (javaRepository: JavaRepository, objectStorageService: ObjectStorageService) =>
                new JavaService(javaRepository, objectStorageService),
        },
        {
            provide: JavaPluginService,
            inject: [JavaPluginRepository, ObjectStorageService],
            useFactory: (javaPluginRepository: JavaPluginRepository, objectStorageService: ObjectStorageService) =>
                new JavaPluginService(javaPluginRepository, objectStorageService),
        },
        IsLoginGuard,
        IsSuperAdminGuard,
    ],
})
export class JavaModule {}
