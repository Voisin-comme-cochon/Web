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
import { NewspaperModule } from './modules/newspaper/newspaper.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntitySubscriber } from './subscribers/user-entity.subscriber';
import { NeighborhoodEntitySubscriber } from './subscribers/neighborhood-entity.subscriber';
import { NeighborhoodUserEntitySubscriber } from './subscribers/neighborhood-users-entity.subscriber';
import { TagEntitySubscriber } from './subscribers/tag-entity.subscriber';
import { UserTagsEntitySubscriber } from './subscribers/user-tags-entity.subscriber';
import { EventEntitySubscriber } from './subscribers/event-entity.subscriber';
import { EventRegisterEntitySubscriber } from './subscribers/event-register-entity.subscriber';
import { GroupEntitySubscriber } from './subscribers/group-entity.subscriber';
import { GroupMembershipEntitySubscriber } from './subscribers/group-membership-entity.subscriber';
import { LoansModule } from './modules/loans/loans.module';

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
        LoansModule,
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
                GroupEntitySubscriber,
                GroupMembershipEntitySubscriber,
            ],
            autoLoadEntities: true,
        }),
        Neo4jModule,
        NewspaperModule,
        MongooseModule.forRoot(
            process.env.VCC_MONGO_URI || "mongodb://admin:adminpass@localhost:27017/mongo?authSource=admin"
          )          

    ], 
    providers: [
        UserEntitySubscriber,
        NeighborhoodEntitySubscriber,
        NeighborhoodUserEntitySubscriber,
        TagEntitySubscriber,
        UserTagsEntitySubscriber,
        EventEntitySubscriber,
        EventRegisterEntitySubscriber,
        GroupEntitySubscriber,
        GroupMembershipEntitySubscriber,
    ],
})
export class AppModule {}
