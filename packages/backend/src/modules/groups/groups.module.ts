import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TagsModule } from '../tags/tags.module';
import { AuthModule } from '../auth/auth.module';
import { GroupsRepository } from './domain/groups.abstract.repository';
import { GroupsController } from './controllers/groups.controller';
import { GroupsService } from './services/groups.service';
import { GroupsRepositoryImplementation } from './repository/groups.repository.implementation';

@Module({
    imports: [TagsModule, AuthModule],
    controllers: [GroupsController],
    exports: [GroupsRepository, GroupsService],
    providers: [
        {
            provide: GroupsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new GroupsRepositoryImplementation(dataSource),
        },
        {
            provide: GroupsService,
            inject: [GroupsRepository],
            useFactory: (groupRepository: GroupsRepository) => new GroupsService(groupRepository),
        },
    ],
})
export class GroupsModule {}
