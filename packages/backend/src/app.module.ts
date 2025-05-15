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
import { NeighborhoodUserModule } from './modules/neighborhood-user/neighborhood-user.module';
import { GroupsModule } from './modules/groups/groups.module';
import { SalesModule } from './modules/sales/sales.module';

@Module({
    imports: [
        UsersModule,
        AuthModule,
        TagsModule,
        EventsModule,
        TicketsModule,
        NeighborhoodModule,
        NeighborhoodUserModule,
        MailerModule,
        GroupsModule,
        SalesModule,
        ObjectStorageModule,
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
            autoLoadEntities: true,
        }),
    ],
    providers: [],
})
export class AppModule {}
