import { forwardRef, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { UsersService } from '../users/services/users.service';
import { NeighborhoodUserRepository } from '../neighborhoods/domain/neighborhood-user.abstract.repository';
import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';
import { NeighborhoodRepository } from '../neighborhoods/domain/neighborhood.abstract.repository';
import { GroupRepository } from './domain/group.abstract.repository';
import { GroupMessageRepository } from './domain/group-message.abstract.repository';
import { GroupMembershipRepository } from './domain/group-membership.abstract.repository';
import { GroupRepositoryImplementation } from './repository/group.repository.implementation';
import { GroupMessageRepositoryImplementation } from './repository/group-message.repository.implementation';
import { GroupMembershipRepositoryImplementation } from './repository/group-membership.repository.implementation';
import { MessagingService } from './services/messaging.service';
import { MessagingController } from './controllers/messaging.controller';
import { MessagingGateway } from './gateways/messaging.gateway';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        forwardRef(() => UsersModule),
        forwardRef(() => NeighborhoodModule),
        ObjectStorageModule,
    ],
    controllers: [MessagingController],
    exports: [GroupRepository, GroupMessageRepository, GroupMembershipRepository, MessagingService, MessagingGateway],
    providers: [
        {
            provide: GroupRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new GroupRepositoryImplementation(dataSource),
        },
        {
            provide: GroupMessageRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new GroupMessageRepositoryImplementation(dataSource),
        },
        {
            provide: GroupMembershipRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new GroupMembershipRepositoryImplementation(dataSource),
        },
        {
            provide: MessagingService,
            inject: [
                GroupRepository,
                GroupMessageRepository,
                GroupMembershipRepository,
                NeighborhoodRepository,
                NeighborhoodUserRepository,
                UsersService,
                ObjectStorageService,
            ],
            useFactory: (
                groupRepository: GroupRepository,
                messageRepository: GroupMessageRepository,
                membershipRepository: GroupMembershipRepository,
                neighborhoodRepository: NeighborhoodRepository,
                neighborhoodUserRepository: NeighborhoodUserRepository,
                usersService: UsersService,
                objectStorageService: ObjectStorageService
            ) =>
                new MessagingService(
                    groupRepository,
                    messageRepository,
                    membershipRepository,
                    neighborhoodRepository,
                    neighborhoodUserRepository,
                    usersService,
                    objectStorageService
                ),
        },
        MessagingGateway,
    ],
})
export class MessagingModule {}
