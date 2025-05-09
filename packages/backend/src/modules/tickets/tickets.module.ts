import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IsLoginGuard } from '../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../middleware/is-super-admin.middleware';
import { AuthModule } from '../auth/auth.module';
import { TicketsRepository } from './domain/tickets.abstract.repository';
import { TicketsController } from './controllers/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { TicketsRepositoryImplementation } from './repository/tickets.repository.implementation';

@Module({
    imports: [AuthModule],
    controllers: [TicketsController],
    exports: [TicketsRepository, TicketsService],
    providers: [
        {
            provide: TicketsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new TicketsRepositoryImplementation(dataSource),
        },
        {
            provide: TicketsService,
            inject: [TicketsRepository],
            useFactory: (userRepository: TicketsRepository) => new TicketsService(userRepository),
        },
        IsLoginGuard,
        IsSuperAdminGuard,
    ],
})
export class TicketsModule {}
