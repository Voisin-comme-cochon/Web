import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { TagsRepository } from './domain/tags.abstract.repository';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';
import { TagsRepositoryImplementation } from './repository/tags.repository.implementation';

@Module({
    imports: [AuthModule],
    controllers: [TagsController],
    exports: [TagsRepository, TagsService],
    providers: [
        {
            provide: TagsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new TagsRepositoryImplementation(dataSource),
        },
        {
            provide: TagsService,
            inject: [TagsRepository],
            useFactory: (tagsRepository: TagsRepository) => new TagsService(tagsRepository),
        },
    ],
})
export class TagsModule {}
