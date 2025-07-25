import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TagsModule } from '../tags/tags.module';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';

import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { MailerModule } from '../mailer/mailer.module';
import { MailerService } from '../mailer/services/mailer.service';
import { NeighborhoodService } from '../neighborhoods/services/neighborhood.service';
import { TagsService } from '../tags/services/tags.service';
import { EventsRepository } from './domain/events.abstract.repository';
import { EventsRepositoryImplementation } from './repository/events.repository.implementation';
import { EventsService } from './services/events.service';
import { EventsController } from './controllers/events.controller';

@Module({
    imports: [AuthModule, UsersModule, TagsModule, NeighborhoodModule, ObjectStorageModule, MailerModule],
    controllers: [EventsController],
    providers: [
        {
            provide: EventsRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new EventsRepositoryImplementation(dataSource),
        },
        {
            provide: EventsService,
            inject: [EventsRepository, ObjectStorageService, MailerService, NeighborhoodService, TagsService],
            useFactory: (
                eventsRepository: EventsRepository,
                objectStorageService: ObjectStorageService,
                mailerService: MailerService,
                neighborhoodService: NeighborhoodService,
                tagsService: TagsService
            ) =>
                new EventsService(
                    eventsRepository,
                    objectStorageService,
                    neighborhoodService,
                    tagsService,
                    mailerService
                ),
        },
    ],
    exports: [EventsRepository, EventsService],
})
export class EventsModule {}
