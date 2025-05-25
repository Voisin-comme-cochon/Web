import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';
import { UsersRepository } from './domain/users.abstract.repository';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserRepositoryImplementation } from './repository/user.repository.implementation';

@Module({
    imports: [AuthModule, ObjectStorageModule],
    controllers: [UsersController],
    exports: [UsersRepository, UsersService],
    providers: [
        {
            provide: UsersRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new UserRepositoryImplementation(dataSource),
        },
        {
            provide: UsersService,
            inject: [UsersRepository, ObjectStorageService],
            useFactory: (userRepository: UsersRepository, objectStorageService: ObjectStorageService) =>
                new UsersService(userRepository, objectStorageService),
        },
    ],
})
export class UsersModule {}
