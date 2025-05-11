import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { TagsModule } from '../tags/tags.module';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';
import { EventsRepository } from './domain/events.abstract.repository';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { EventsRepositoryImplementation } from './repository/events.repository.implementation';

@Module({
    imports: [UsersModule, AuthModule, TagsModule, NeighborhoodModule],
    controllers: [EventsController],
    exports: [EventsRepository, EventsService],
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
})
export class EventsModule {}
