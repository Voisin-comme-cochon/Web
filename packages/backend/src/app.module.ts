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
            autoLoadEntities: true,
        }),
    ],
    providers: [],
})
export class AppModule {}
