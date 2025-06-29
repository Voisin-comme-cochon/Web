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
import { NeighborhoodRepository } from './domain/neighborhood.abstract.repository';
import { NeighborhoodRepositoryImplementation } from './repository/neighborhood.repository.implementation';
import { NeighborhoodInvitationRepository } from './domain/neighborhood-invitation.abstract.repository';
import { NeighborhoodInvitationRepositoryImplementation } from './repository/neighborhood-invitation.repository.implementation';
import { NeighborhoodUserService } from './services/neighborhood-user.service';
import { NeighborhoodUserRepository } from './domain/neighborhood-user.abstract.repository';
import { NeighborhoodUserRepositoryImplementation } from './repository/neighborhood-user.repository.implementation';

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
            provide: NeighborhoodUserRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodUserRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodService,
            inject: [NeighborhoodRepository, ObjectStorageService, MailerService, UsersService],
            useFactory: (
                neighborhoodRepository: NeighborhoodRepository,
                objectStorageService: ObjectStorageService,
                mailerSerice: MailerService,
                usersService: UsersService
            ) => new NeighborhoodService(neighborhoodRepository, objectStorageService, mailerSerice, usersService),
        },
        {
            provide: NeighborhoodInvitationService,
            inject: [
                NeighborhoodInvitationRepository,
                NeighborhoodService,
                NeighborhoodUserService,
                JwtService,
                UsersService,
                MailerService,
            ],
            useFactory: (
                invRepo: NeighborhoodInvitationRepository,
                nbService: NeighborhoodService,
                nbUserService: NeighborhoodUserService,
                jwt: JwtService,
                users: UsersService,
                mailer: MailerService
            ) => new NeighborhoodInvitationService(invRepo, nbService, nbUserService, jwt, users, mailer),
        },
        {
            provide: NeighborhoodUserService,
            inject: [NeighborhoodUserRepository, NeighborhoodService, UsersService, MailerService],
            useFactory: (
                neighborhoodUserRepository: NeighborhoodUserRepository,
                neighborhoodService: NeighborhoodService,
                usersService: UsersService,
                mailerService: MailerService
            ) =>
                new NeighborhoodUserService(
                    neighborhoodUserRepository,
                    neighborhoodService,
                    usersService,
                    mailerService
                ),
        },
    ],
    exports: [NeighborhoodService, NeighborhoodUserRepository, NeighborhoodRepository],
})
export class NeighborhoodModule {}
