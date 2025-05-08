import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';
import { NeighborhoodRepository } from './domain/neighborhood.abstract.repository';
import { NeighborhoodController } from './controllers/neighborhood.controller';
import { NeighborhoodService } from './services/neighborhood.service';
import { NeighborhoodRepositoryImplementation } from './repository/neighborhood.repository.implementation';

@Module({
    imports: [AuthModule, UsersModule, ObjectStorageModule],
    controllers: [NeighborhoodController],
    providers: [
        {
            provide: NeighborhoodRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new NeighborhoodRepositoryImplementation(dataSource),
        },
        {
            provide: NeighborhoodService,
            inject: [NeighborhoodRepository, ObjectStorageService],
            useFactory: (neighborhoodRepository: NeighborhoodRepository, objectStorageService: ObjectStorageService) =>
                new NeighborhoodService(neighborhoodRepository, objectStorageService),
        },
    ],
    exports: [NeighborhoodRepository, NeighborhoodService],
})
export class NeighborhoodModule {}
