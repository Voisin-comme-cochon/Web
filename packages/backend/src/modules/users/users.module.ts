import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersRepository } from '../domain/users.abstract.repository';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserRepositoryImplementation } from './repository/user.repository.implementation';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [
        {
            provide: UsersRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new UserRepositoryImplementation(dataSource),
        },
        {
            provide: UsersService,
            inject: [UsersRepository],
            useFactory: (userRepository: UsersRepository) => new UsersService(userRepository),
        },
    ],
})
export class UsersModule {}
