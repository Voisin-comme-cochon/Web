import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';
import { AuthModule } from '../auth/auth.module';
import { SalesRepository } from './domain/sales.abstract.repository';
import { SalesController } from './controllers/sales.controller';
import { SalesService } from './services/sales.service';
import { SalesRepositoryImplementation } from './repository/sales.repository.implementation';

@Module({
    imports: [NeighborhoodModule, AuthModule],
    controllers: [SalesController],
    exports: [SalesRepository, SalesService],
    providers: [
        {
            provide: SalesRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new SalesRepositoryImplementation(dataSource),
        },
        {
            provide: SalesService,
            inject: [SalesRepository],
            useFactory: (salesRepository: SalesRepository) => new SalesService(salesRepository),
        },
    ],
})
export class SalesModule {}
