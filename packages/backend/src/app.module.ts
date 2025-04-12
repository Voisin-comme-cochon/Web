import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [
        UsersModule,
        AuthModule,
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
