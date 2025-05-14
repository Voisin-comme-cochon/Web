import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';
import { NeighborhoodService } from '../neighborhoods/services/neighborhood.service';
import { AuthModule } from '../auth/auth.module';
import { NeighborhoodInvitationService } from './services/neighborhood-invitation.service';
import { NeighborhoodInvitationRepositoryImplementation } from './repository/neighborhood-invitation.repository.implementation';
import { NeighborhoodInvitationRepository } from './domain/neighborhood-invitation.abstract.repository';
import { NeighborhoodInvitationController } from './controllers/neighborhood-invitation.controller';

@Module({
    imports: [
        NeighborhoodModule,
        JwtModule.register({
            secret: process.env.VCC_JWT_SECRET,
        }),
        AuthModule,
    ],
    controllers: [NeighborhoodInvitationController],
    providers: [
        {
            provide: NeighborhoodInvitationRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodInvitationRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodInvitationService,
            inject: [NeighborhoodInvitationRepository, NeighborhoodService, JwtService],
            useFactory: (
                neighborhoodInvitationRepository: NeighborhoodInvitationRepository,
                neighborhoodService: NeighborhoodService,
                jwtService: JwtService
            ) => new NeighborhoodInvitationService(neighborhoodInvitationRepository, neighborhoodService, jwtService),
        },
    ],
    exports: [NeighborhoodInvitationService],
})
export class NeighborhoodInvitationModule {}
