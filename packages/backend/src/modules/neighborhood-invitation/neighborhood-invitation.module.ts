import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NeighborhoodInvitationService } from './services/neighborhood-invitation.service';
import { NeighborhoodInvitationRepositoryImplementation } from './repository/neighborhood-invitation.repository.implementation';
import { NeighborhoodInvitationRepository } from './domain/neighborhood-invitation.abstract.repository';

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: NeighborhoodInvitationRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodInvitationRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodInvitationService,
            inject: [NeighborhoodInvitationRepository],
            useFactory: (neighborhoodInvitationRepository: NeighborhoodInvitationRepository) =>
                new NeighborhoodInvitationService(neighborhoodInvitationRepository),
        },
    ],
    exports: [NeighborhoodInvitationService],
})
export class NeighborhoodInvitationModule {}
