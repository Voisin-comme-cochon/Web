import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';
import { MailerModule } from '../mailer/mailer.module';
import { UsersService } from '../users/services/users.service';
import { MailerService } from '../mailer/services/mailer.service';
import { UsersModule } from '../users/users.module';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { NeighborhoodController } from './controllers/neighborhood.controller';
import { NeighborhoodService } from './services/neighborhood.service';
import { NeighborhoodInvitationService } from './services/neighborhood-invitation.service';
import { NeighborhoodAppService } from './services/neighborhood-app.service';
import { NeighborhoodRepository } from './domain/neighborhood.abstract.repository';
import { NeighborhoodRepositoryImplementation } from './repository/neighborhood.repository.implementation';
import { NeighborhoodInvitationRepository } from './domain/neighborhood-invitation.abstract.repository';
import { NeighborhoodInvitationRepositoryImplementation } from './repository/neighborhood-invitation.repository.implementation';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        MailerModule,
        ObjectStorageModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
    ],
    controllers: [NeighborhoodController],
    providers: [
        {
            provide: NeighborhoodRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodInvitationRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodInvitationRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodService,
            inject: [NeighborhoodRepository, ObjectStorageService],
            useFactory: (neighborhoodRepository: NeighborhoodRepository, objectStorageService: ObjectStorageService) =>
                new NeighborhoodService(neighborhoodRepository, objectStorageService),
        },
        {
            provide: NeighborhoodInvitationService,
            inject: [NeighborhoodInvitationRepository, NeighborhoodService, JwtService, UsersService, MailerService],
            useFactory: (
                invRepo: NeighborhoodInvitationRepository,
                nbService: NeighborhoodService,
                jwt: JwtService,
                users: UsersService,
                mailer: MailerService
            ) => new NeighborhoodInvitationService(invRepo, nbService, jwt, users, mailer),
        },
        {
            provide: NeighborhoodAppService,
            inject: [NeighborhoodService, NeighborhoodInvitationService],
            useFactory: (
                neighborhoodService: NeighborhoodService,
                neighborhoodInvitationService: NeighborhoodInvitationService
            ) => new NeighborhoodAppService(neighborhoodService, neighborhoodInvitationService),
        },
    ],
    exports: [NeighborhoodService],
})
export class NeighborhoodModule {}
