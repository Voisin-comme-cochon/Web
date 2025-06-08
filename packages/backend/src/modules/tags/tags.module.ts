import { forwardRef, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../users/domain/users.abstract.repository';
import { UserRepositoryImplementation } from '../users/repository/user.repository.implementation';
import { TagsRepository } from './domain/tags.abstract.repository';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';
import { TagsRepositoryImplementation } from './repository/tags.repository.implementation';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [TagsController],
    exports: [TagsRepository, TagsService],
    providers: [
        {
            provide: TagsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new TagsRepositoryImplementation(dataSource),
        },
        {
            provide: UsersRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new UserRepositoryImplementation(dataSource),
        },
        {
            provide: TagsService,
            inject: [TagsRepository, UsersRepository],
            useFactory: (tagsRepository: TagsRepository, usersRepository: UsersRepository) =>
                new TagsService(tagsRepository, usersRepository),
        },
    ],
})
export class TagsModule {}
