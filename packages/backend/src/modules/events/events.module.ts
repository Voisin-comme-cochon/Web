import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TagsModule } from '../tags/tags.module';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';

import { EventsRepository } from './domain/events.abstract.repository';
import { EventsRepositoryImplementation } from './repository/events.repository.implementation';
import { EventsService } from './services/events.service';
import { EventsController } from './controllers/events.controller';

@Module({
    imports: [AuthModule, UsersModule, TagsModule, NeighborhoodModule],
    controllers: [EventsController],
    providers: [
        {
            provide: EventsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new EventsRepositoryImplementation(dataSource),
        },
        {
            provide: EventsService,
            inject: [EventsRepository],
            useFactory: (eventsRepository: EventsRepository) => new EventsService(eventsRepository),
        },
    ],
    exports: [EventsRepository, EventsService],
})
export class EventsModule {}
