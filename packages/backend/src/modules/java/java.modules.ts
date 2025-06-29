import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IsLoginGuard } from '../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../middleware/is-super-admin.middleware';
import { AuthModule } from '../auth/auth.module';
import { JavaRepository } from './domain/java.abstract.repository';
import { JavaController } from './controllers/java.controller';
import { JavaService } from './services/java.service';
import { JavaRepositoryImplementation } from './repository/java.repository.implementation';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';

@Module({
    imports: [AuthModule, ObjectStorageModule],
    controllers: [JavaController],
    exports: [JavaRepository, JavaService],
    providers: [
        {
            provide: JavaRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new JavaRepositoryImplementation(dataSource),
        },
        {
            provide: JavaService,
            inject: [JavaRepository, ObjectStorageService],
            useFactory: (javaRepository: JavaRepository, objectStorageService: ObjectStorageService) => new JavaService(javaRepository, objectStorageService),
        },
        IsLoginGuard,
        IsSuperAdminGuard,
    ],
})
export class JavaModule {}
