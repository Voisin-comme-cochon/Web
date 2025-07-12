import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NeighborhoodModule } from './modules/neighborhoods/neighborhood.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { ObjectStorageModule } from './modules/objectStorage/objectStorage.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { TagsModule } from './modules/tags/tags.module';
import { EventsModule } from './modules/events/events.module';
import { SalesModule } from './modules/sales/sales.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { JavaModule } from './modules/java/java.modules';
import { Neo4jModule } from './neo4j/neo4j.module';
import { UserEntitySubscriber } from './subscribers/user-entity.subscriber';
import { NeighborhoodEntitySubscriber } from './subscribers/neighborhood-entity.subscriber';
import { NeighborhoodUserEntitySubscriber } from './subscribers/neighborhood-users-entity.subscriber';
import { TagEntitySubscriber } from './subscribers/tag-entity.subscriber';
import { UserTagsEntitySubscriber } from './subscribers/user-tags-entity.subscriber';
import { EventEntitySubscriber } from './subscribers/event-entity.subscriber';
import { EventRegisterEntitySubscriber } from './subscribers/event-register-entity.subscriber';

@Module({
    imports: [
        UsersModule,
        AuthModule,
        TagsModule,
        EventsModule,
        TicketsModule,
        NeighborhoodModule,
        MailerModule,
        SalesModule,
        ObjectStorageModule,
        JavaModule,
        MessagingModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.VCC_DATABASE_HOST,
            database: process.env.VCC_DATABASE_NAME,
            port: Number(process.env.VCC_DATABASE_PORT),
            username: process.env.VCC_DATABASE_USER,
            password: process.env.VCC_DATABASE_PASSWORD,
            logging: false,
            synchronize: process.env.VCC_DATABASE_SYNCHRONIZE === 'true' || true,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            subscribers: [
                UserEntitySubscriber,
                NeighborhoodEntitySubscriber,
                NeighborhoodUserEntitySubscriber,
                TagEntitySubscriber,
                UserTagsEntitySubscriber,
                EventEntitySubscriber,
                EventRegisterEntitySubscriber,
            ],
            autoLoadEntities: true,
        }),
        Neo4jModule,
    ],
    providers: [
        UserEntitySubscriber,
        NeighborhoodEntitySubscriber,
        NeighborhoodUserEntitySubscriber,
        TagEntitySubscriber,
        UserTagsEntitySubscriber,
        EventEntitySubscriber,
        EventRegisterEntitySubscriber,
    ],
})
export class AppModule {}
