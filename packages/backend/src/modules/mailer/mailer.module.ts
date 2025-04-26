import { join } from 'path';
import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerService } from './services/mailer.service';
import { MailerController } from './controllers/mailer.controller';

@Module({
    imports: [
        NestMailerModule.forRoot({
            transport: {
                host: process.env.VCC_MAIL_HOST,
                port: Number(process.env.VCC_MAIL_PORT),
                secure: process.env.VCC_MAIL_SECURE === 'true',
                auth: {
                    user: process.env.VCC_MAIL_USER,
                    pass: process.env.VCC_MAIL_PASSWORD,
                },
            },
            defaults: {
                from: process.env.VCC_MAIL_FROM,
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new PugAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
    ],
    controllers: [MailerController],
    providers: [MailerService],
    exports: [MailerService],
})
export class MailerModule {}
