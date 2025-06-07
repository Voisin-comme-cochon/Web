import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/domain/users.abstract.repository';
import { NeighborhoodRepository } from '../neighborhoods/domain/neighborhood.abstract.repository';
import { NeighborhoodRepositoryImplementation } from '../neighborhoods/repository/neighborhood.repository.implementation';
import { UserTagsService } from './services/user-tags.service';
import { UserTagsRepository } from './domain/user-tags.abstract.repository';
import { UserTagsRepositoryImplementation } from './repository/user-tags.repository.implementation';
import { TagsRepository } from './domain/tags.abstract.repository';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';
import { TagsRepositoryImplementation } from './repository/tags.repository.implementation';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [TagsController],
    exports: [TagsRepository, TagsService, UserTagsService],
    providers: [
        {
            provide: TagsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new TagsRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodRepositoryImplementation(dataSource),
        },
        {
            provide: TagsService,
            inject: [TagsRepository, NeighborhoodRepository],
            useFactory: (tagsRepository: TagsRepository, neighborhoodRepository: NeighborhoodRepository) => new TagsService(tagsRepository, neighborhoodRepository),
        },
        {
            provide: UserTagsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new UserTagsRepositoryImplementation(dataSource),
        },
        {
            provide: UserTagsService,
            inject: [UsersRepository, TagsRepository, UserTagsRepository],
            useFactory: (usersRepository: UsersRepository, tagsRepository: TagsRepository, userTagsRepository: UserTagsRepository) => new UserTagsService(usersRepository, tagsRepository, userTagsRepository),
        },
    ],
})
export class TagsModule {}
