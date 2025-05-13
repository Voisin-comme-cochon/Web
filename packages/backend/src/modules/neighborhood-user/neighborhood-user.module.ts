import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NeighborhoodUserService } from './services/neighborhood-user.service';
import { NeighborhoodUserRepositoryImplementation } from './repository/neighborhood-user.repository.implementation';
import { NeighborhoodUserRepository } from './domain/neighborhood-user.abstract.repository';

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: NeighborhoodUserRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodUserRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodUserService,
            inject: [NeighborhoodUserRepository],
            useFactory: (neighborhoodUserRepository: NeighborhoodUserRepository) =>
                new NeighborhoodUserService(neighborhoodUserRepository),
        },
    ],
    exports: [NeighborhoodUserService],
})
export class NeighborhoodUserModule {}
