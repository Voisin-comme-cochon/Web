import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IsLoginGuard } from '../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../middleware/is-super-admin.middleware';
import { AuthModule } from '../auth/auth.module';
import { JavaRepository } from './domain/java.abstract.repository';
import { JavaController } from './controllers/java.controller';
import { JavaService } from './services/java.service';
import { JavaRepositoryImplementation } from './repository/java.repository.implementation';

@Module({
    imports: [AuthModule],
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
            inject: [JavaRepository],
            useFactory: (javaRepository: JavaRepository) => new JavaService(javaRepository),
        },
        IsLoginGuard,
        IsSuperAdminGuard,
    ],
})
export class JavaModule {}
