import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/domain/users.abstract.repository';
import { AuthModule } from '../auth/auth.module';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';
import { NeighborhoodRepository } from '../neighborhoods/domain/neighborhood.abstract.repository';
import { NeighborhoodUserRepository } from '../neighborhoods/domain/neighborhood-user.abstract.repository';
import { ItemsRepository } from './domain/items.abstract.repository';
import { LoanRequestsRepository } from './domain/loan-requests.abstract.repository';
import { LoansRepository } from './domain/loans.abstract.repository';

import { ItemsRepositoryImplementation } from './repository/items.repository.implementation';
import { LoanRequestsRepositoryImplementation } from './repository/loan-requests.repository.implementation';
import { LoansRepositoryImplementation } from './repository/loans.repository.implementation';

import { ItemsService } from './services/items.service';
import { LoanRequestsService } from './services/loan-requests.service';
import { LoansService } from './services/loans.service';

import { ItemsController } from './controllers/items.controller';
import { LoansController } from './controllers/loans.controller';

@Module({
    imports: [UsersModule, AuthModule, NeighborhoodModule],
    controllers: [ItemsController, LoansController],
    exports: [
        ItemsRepository,
        LoanRequestsRepository,
        LoansRepository,
        ItemsService,
        LoanRequestsService,
        LoansService,
    ],
    providers: [
        {
            provide: ItemsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new ItemsRepositoryImplementation(dataSource),
        },
        {
            provide: LoanRequestsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new LoanRequestsRepositoryImplementation(dataSource),
        },
        {
            provide: LoansRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new LoansRepositoryImplementation(dataSource),
        },
        {
            provide: ItemsService,
            inject: [ItemsRepository, NeighborhoodRepository, NeighborhoodUserRepository],
            useFactory: (
                itemsRepository: ItemsRepository,
                neighborhoodRepository: NeighborhoodRepository,
                neighborhoodUserRepository: NeighborhoodUserRepository
            ) => new ItemsService(itemsRepository, neighborhoodRepository, neighborhoodUserRepository),
        },
        {
            provide: LoanRequestsService,
            inject: [
                LoanRequestsRepository,
                LoansRepository,
                ItemsRepository,
                UsersRepository,
                NeighborhoodUserRepository,
            ],
            useFactory: (
                loanRequestsRepository: LoanRequestsRepository,
                loansRepository: LoansRepository,
                itemsRepository: ItemsRepository,
                usersRepository: UsersRepository,
                neighborhoodUserRepository: NeighborhoodUserRepository
            ) =>
                new LoanRequestsService(
                    loanRequestsRepository,
                    loansRepository,
                    itemsRepository,
                    usersRepository,
                    neighborhoodUserRepository
                ),
        },
        {
            provide: LoansService,
            inject: [LoansRepository, ItemsRepository],
            useFactory: (loansRepository: LoansRepository, itemsRepository: ItemsRepository) =>
                new LoansService(loansRepository, itemsRepository),
        },
    ],
})
export class LoansModule {}
