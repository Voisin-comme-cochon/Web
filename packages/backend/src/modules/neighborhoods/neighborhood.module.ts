import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NeighborhoodRepository } from './domain/neighborhood.abstract.repository';
import { NeighborhoodController } from './controllers/neighborhood.controller';
import { NeighborhoodService } from './services/neighborhood.service';
import { NeighborhoodRepositoryImplementation } from './repository/neighborhood.repository.implementation';

@Module({
    imports: [],
    controllers: [NeighborhoodController],
    exports: [NeighborhoodRepository, NeighborhoodService],
    providers: [
        {
            provide: NeighborhoodRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodService,
            inject: [NeighborhoodRepository],
            useFactory: (neighborhoodRepository: NeighborhoodRepository) =>
                new NeighborhoodService(neighborhoodRepository),
        },
    ],
})
export class NeighborhoodModule {}
