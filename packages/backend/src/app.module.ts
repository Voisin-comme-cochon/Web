import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';

@Module({
    imports: [UsersModule,
    TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        logging: false,
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || true,
        entities: [],
    })
    ],
    providers: [],
})
export class AppModule {}
